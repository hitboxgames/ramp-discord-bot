import ramp from "..";

export async function fetchStatementByDateRange(fromDate: Date, toDate: Date) {
  try {
    const response = await ramp.get("/statements", {
      params: {
        from_date: fromDate,
        to_date: toDate,
        order_by_date_desc: true,
      },
    });

    if (!response.data?.data) {
      console.log("No transactions found for the specified date range");
      return [];
    }

    console.log(`Found ${response.data.data.length} transactions`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}
