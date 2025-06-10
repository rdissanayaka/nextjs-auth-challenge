"use client";
import React, { useEffect, useState } from "react";

type Transaction = {
  date: string;
  referenceId: string;
  to: string;
  subtext: string;
  type: string;
  amount: string;
};

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transaction-history");
        const data = (await response.json()) as Transaction[];
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, []);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100 text-left text-sm font-medium text-gray-600">
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Reference ID</th>
            <th className="px-4 py-2">To</th>
            <th className="px-4 py-2">Transaction Type</th>
            <th className="px-4 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-800 divide-y divide-gray-200">
          {transactions.map((txn, index) => (
            <tr key={index}>
              <td className="px-4 py-3">{txn.date}</td>
              <td className="px-4 py-3">{txn.referenceId}</td>
              <td className="px-4 py-3">
                <div className="font-medium">{txn.to}</div>
                <div className="text-gray-500 text-xs">{txn.subtext}</div>
              </td>
              <td className="px-4 py-3">{txn.type}</td>
              <td className="px-4 py-3 text-right">{txn.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
