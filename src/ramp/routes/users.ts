import { RampRole } from "../../types/roles";
import { v4 as uuidv4 } from "uuid";
import ramp from "..";

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
