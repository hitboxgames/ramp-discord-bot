import { InvitePayload } from "../commands/invite";
import { RampRole } from "../types/roles";
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

export async function fetchUserByEmail(email: string) {
  try {
    const response = await apiClient.get("/users", {
      params: { email },
    });

    if (!response.data?.data) {
      console.log("No user found with this specified email");
      return null;
    }

    const users = response.data.data;
    const user = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (user) {
      console.log(`Found user:`, user);
      return user;
    }

    return null;
  } catch (error: any) {
    console.error("Error fetching user:", {
      status: error.response?.status,
      message: error.response?.data?.error_v2,
      email: email,
    });
    throw error;
  }
}

export async function createUserInvite(
  email: string,
  first_name: string,
  last_name: string,
  role: RampRole
) {
  try {
    const response = await apiClient.post("/users/deferred", {
      params: { email, first_name, last_name, role },
    });

    if (response.status === 201) {
      console.log("Async user invite created successfully");
    } else {
      console.error("Failed to create user invite. Response:", response.data);
    }
  } catch (error: any) {
    console.error("Error inviting user:", {
      status: error.response?.status,
      message: error.response?.data?.error_v2,
    });
    throw error;
  }
}

export async function createPhysicalCard(user_id: string) {
  try {
    const response = await apiClient.post("/cards/deferred/physical", {
      params: {
        user_id,
      },
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
      params: {
        user_id,
      },
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
