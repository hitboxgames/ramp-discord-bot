import { v4 as uuidv4 } from "uuid";
import ramp from "..";

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
      return response.data.id;
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
