import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getBalance, transferCredits, getTransactions, Transaction } from '@/app/actions/wallet';
import { useToast } from "@/components/ui/use-toast";

interface WalletProps {
  username: string;
}

const Wallet: React.FC<WalletProps> = ({ username }) => {
  const [balance, setBalance] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBalanceAndTransactions = async () => {
      try {
        const fetchedBalance = await getBalance(username);
        setBalance(fetchedBalance);
        const fetchedTransactions = await getTransactions(username);
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        toast({
          title: "Error",
          description: "Failed to load wallet data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchBalanceAndTransactions();
  }, [username, toast]);

  const handleSend = async () => {
    if (!recipient || !amount) {
      toast({
        title: "Error",
        description: "Please enter both recipient and amount.",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > balance) {
      toast({
        title: "Error",
        description: "Invalid amount. Please check your balance and enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await transferCredits(username, recipient, amountNum);
      if (result.success) {
        const newBalance = await getBalance(username);
        setBalance(newBalance);
        const updatedTransactions = await getTransactions(username);
        setTransactions(updatedTransactions);
        setRecipient('');
        setAmount('');

        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during transfer:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return <div className="wallet-loading">Loading wallet data...</div>;
  }

  return (
    <div className="wallet-container">
      <h2 className="wallet-title">Wallet</h2>
      <div className="wallet-balance">
        <span>Credit Balance:</span>
        <span className="balance-amount">{balance} credits</span>
      </div>
      <div className="wallet-send">
        <Input
          type="text"
          placeholder="Recipient's Empire ID"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="wallet-input"
        />
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="wallet-input"
        />
        <Button 
          onClick={handleSend} 
          className="wallet-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Send'}
        </Button>
      </div>
      <div className="wallet-transactions">
        <h3>Transaction Log</h3>
        {transactions.length === 0 ? (
          <div className="no-transactions">No transactions found.</div>
        ) : (
          transactions.map((transaction, index) => (
            <div key={index} className="transaction-item">
              <span>{transaction.sender === username ? 'To:' : 'From:'} {transaction.sender === username ? transaction.recipient : transaction.sender}</span>
              <span>{transaction.sender === username ? '-' : '+'}{transaction.amount} credits</span>
              <span>{new Date(transaction.date).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Wallet;

