'use server'

import { Redis } from '@upstash/redis'
import { findUser } from '@/lib/users'

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

export async function getBalance(username: string): Promise<number> {
  try {
    const balance = await redis.get(`wallet:${username}:balance`);
    return balance ? Number(balance) : 1000; // Default balance is 1000
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 1000; // Return default balance if there's an error
  }
}

export async function updateBalance(username: string, newBalance: number): Promise<number> {
  try {
    await redis.set(`wallet:${username}:balance`, newBalance);
    return newBalance;
  } catch (error) {
    console.error('Error updating balance:', error);
    return await getBalance(username); // Return current balance if update fails
  }
}

export async function verifyUser(username: string): Promise<boolean> {
  const user = await findUser(username);
  return !!user;
}

export interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
  date: string;
}

export async function getTransactions(username: string): Promise<Transaction[]> {
  try {
    const transactions = await redis.lrange(`wallet:${username}:transactions`, 0, -1);
    if (!transactions || transactions.length === 0) {
      return [];
    }
    return transactions.map(t => {
      try {
        // If the transaction is already an object, don't parse it
        const transaction = typeof t === 'string' ? JSON.parse(t) : t;
        if (typeof transaction === 'object' && transaction !== null &&
            'sender' in transaction && 'recipient' in transaction &&
            'amount' in transaction && 'date' in transaction) {
          return transaction as Transaction;
        } else {
          console.error('Invalid transaction format:', transaction);
          return null;
        }
      } catch (parseError) {
        console.error('Error parsing transaction:', t, parseError);
        return null;
      }
    }).filter((t): t is Transaction => t !== null);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function addTransaction(transaction: Transaction): Promise<void> {
  try {
    const transactionString = JSON.stringify(transaction);
    await redis.lpush(`wallet:${transaction.sender}:transactions`, transactionString);
    await redis.lpush(`wallet:${transaction.recipient}:transactions`, transactionString);
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw new Error('Failed to add transaction');
  }
}

export async function transferCredits(sender: string, recipient: string, amount: number): Promise<{ success: boolean; message: string }> {
  try {
    const recipientExists = await verifyUser(recipient);
    if (!recipientExists) {
      return { success: false, message: "Recipient is not registered in the system." };
    }

    const senderBalance = await getBalance(sender);
    if (senderBalance < amount) {
      return { success: false, message: "Insufficient credits for transfer." };
    }

    const recipientBalance = await getBalance(recipient);

    await updateBalance(sender, senderBalance - amount);
    await updateBalance(recipient, recipientBalance + amount);

    const transaction: Transaction = {
      sender,
      recipient,
      amount,
      date: new Date().toISOString()
    };
    await addTransaction(transaction);

    return { success: true, message: "Transfer completed successfully." };
  } catch (error) {
    console.error('Error during credit transfer:', error);
    return { success: false, message: "An error occurred during the transfer." };
  }
}

