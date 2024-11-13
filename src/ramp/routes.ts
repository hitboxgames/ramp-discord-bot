import { RampRole } from "../types/roles";
import { v4 as uuidv4 } from "uuid";
import ramp from ".";

export async function fetchTransactionsByDateRange(
  fromDate: Date,
  toDate: Date
) {
  try {
    const response = await ramp.get("/transactions", {
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

export async function fetchUserByEmail(email: string) {
  try {
    const response = await ramp.get("/users", {
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
    const idempotencyKey = uuidv4();
    const payload = {
      email,
      first_name,
      last_name,
      role,
      idempotency_key: idempotencyKey,
    };
    const response = await ramp.post("/users/deferred", payload);

    console.log(response);

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

export async function createPhysicalCard(
  user_id: string,
  lock_date?: string,
  display_name?: string,
  amount?: string,
  interval?: string
) {
  try {
    const idempotency_key = uuidv4();
    const payload = {
      display_name,
      idempotency_key,
      spending_restrictions: {
        amount,
        interval,
        lock_date,
      },
      user_id,
    };
    const response = await ramp.post("/cards/deferred/physical", payload);

    if (response.status === 200) {
      console.log("Physical card created successfully");
      return response.data.id
    } else {
      console.error("Failed to create physical card. Status:", response.status);
    }
  } catch (error: any) {
    console.error("Error creating physical card:", {
      status: error.response?.status,
      message: error.response?.data?.error_v2,
    });
    throw error;
  }
}

export async function createVirtualCard(
  user_id: string,
  lock_date?: string,
  display_name?: string,
  amount?: string,
  interval?: string
) {
  try {
    const idempotency_key = uuidv4();
    const payload = {
      display_name,
      idempotency_key,
      spending_restrictions: {
        amount,
        interval,
        lock_date,
      },
      user_id,
    };
    const response = await ramp.post("/cards/deferred/virtual", payload);

    if (response.status === 200) {
      console.log("Virtual card created successfully");
      return response.data.id
    } else {
      console.error("Failed to create virtual card. Status:", response.status);
    }
  } catch (error: any) {
    console.error("Error creating virtual card:", {
      status: error.response?.status,
      message: error.response?.data?.error_v2,
    });
    throw error;
  }
}
