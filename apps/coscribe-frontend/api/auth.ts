import { HTTP_URL } from "@/config";
export const signupUser = async (userData: { email: string; password: string,name:string }) => {
    const response = await fetch(`${HTTP_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
  
    return response.json();
  };
  export const signInUser = async (userData: { email: string; password: string }) => {

    const response = await fetch(`${HTTP_URL}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  
    if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        throw new Error(errorData.message);
    }
  
    return response.json();
  };

