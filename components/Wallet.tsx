import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getBalance, transferCredits, getTransactions, Transaction } from '@/app/actions/wallet';
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="cogitator-interface">
      <div className="terminal-header">
        <div className="header-title">COGITATOR INTERFACE v2.781</div>
        <div className="header-status">WALLET ACCESS: GRANTED</div>
      </div>
      <div className="terminal-content">
        <div className="wallet-balance">
          <span className="balance-label">CREDIT BALANCE:</span>
          <span className="balance-amount">{balance} CREDITS</span>
        </div>
        <div className="wallet-transfer">
          <h3 className="section-title">EXECUTE TRANSFER</h3>
          <div className="input-section">
            <Input
              type="text"
              placeholder="RECIPIENT EMPIRE ID"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="cogitator-input"
            />
            <Input
              type="number"
              placeholder="AMOUNT"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="cogitator-input"
            />
            <Button 
              onClick={handleSend} 
              className="execute-button" 
              disabled={isLoading}
            >
              {isLoading ? 'PROCESSING...' : 'EXECUTE TRANSFER'}
            </Button>
          </div>
        </div>
        <div className="wallet-transactions">
          <h3 className="section-title">TRANSACTION LOG</h3>
          <ScrollArea className="h-[calc(100vh-400px)]">
            {transactions.length === 0 ? (
              <div className="no-transactions">NO TRANSACTIONS FOUND</div>
            ) : (
              transactions.map((transaction, index) => (
                <div key={index} className="transaction-item">
                  <span className="transaction-type">
                    {transaction.sender === username ? 'TO:' : 'FROM:'}
                  </span>
                  <span className="transaction-party">
                    {transaction.sender === username ? transaction.recipient : transaction.sender}
                  </span>
                  <span className="transaction-amount">
                    {transaction.sender === username ? '-' : '+'}
                    {transaction.amount} CREDITS
                  </span>
                  <span className="transaction-date">
                    {new Date(transaction.date).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Wallet;

