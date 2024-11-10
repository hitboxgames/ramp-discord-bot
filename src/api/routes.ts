import { getLastWeekRange } from "../utils/dates";
import apiClient from "./ramp";

export async function fetchRecentTransactions() {
  try {
    const dateRange = getLastWeekRange();

    const response = await apiClient.get("/transactions", {
      params: {
        from_date: dateRange.fromDate,
        to_date: dateRange.toDate,
        order_by_date_desc: true,
        page_size: 10,
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

export async function createPhysicalCard(user_id: string) {
  try {
    const response = await apiClient.post("/cards/deferred/physical", {
      user_id,
    });

    if (response.status === 200) {
      console.log("Physical card created successfully");
    } else {
      console.error("Failed to create physical card. Status:", response.status);
    }
  } catch (error) {
    console.error("Error creating physical card:", error);
    throw error;
  }
}

export async function createVirtualCard(user_id: string) {
  try {
    const response = await apiClient.post("/cards/deferred/virtual", {
      user_id,
    });

    if (response.status === 200) {
      console.log("Virtual card created successfully");
    } else {
      console.error("Failed to create virtual card. Status:", response.status);
    }
  } catch (error) {
    console.error("Error creating virtual card:", error);
    throw error;
  }
}
