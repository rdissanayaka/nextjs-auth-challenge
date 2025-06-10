import TransactionTable from "@/components/transaction-table";

const DashboardPage = () => {
  return (
    <div className="max-w-4xl my-20 mx-auto space-y-4 p-6 bg-white rounded-lg border">
      <div>
        <h2 className="text-xl font-semibold">Transaction History</h2>
      </div>
      <TransactionTable />
    </div>
  );
};

export default DashboardPage;
