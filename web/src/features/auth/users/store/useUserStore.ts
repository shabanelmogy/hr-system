import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// Helper function to extract value from API response
const extractValue = (response: any) => {
  // If response has a value property and it's successful, return the value
  if (response?.value && response?.isSuccess) {
    return response.value;
  }
  // If response has data property (fallback)
  if (response?.data) {
    return response.data;
  }
  // Otherwise return the response as-is
  return response;
};

// Helper function to extract array of values from API response
const extractValues = (response: any) => {
  const extracted = extractValue(response);
  // If it's an array of wrapped objects, extract values
  if (Array.isArray(extracted) && extracted[0]?.value) {
    return extracted.map((item: any) => extractValue(item));
  }
  return extracted;
};

const useUserStore = create(
  devtools(
    persist(
      (set: any) => ({
        users: [] as any[],

        fetchUsers: async () => {
          const response = await apiService.get(apiRoutes.users.getAll);
          const allUsers = extractValues(response);
          set({ users: allUsers });
          return allUsers;
        },

        addUser: async (userData: any) => {
          const response = await apiService.post(apiRoutes.users.add, userData);
          const newUser = extractValue(response);

          set((state: any) => ({
            users: [...state.users, newUser],
          }));
          return newUser;
        },

        updateUser: async (userData: any) => {
          const response = await apiService.put(
            apiRoutes.users.update(userData.id),
            userData
          );
          const updatedUser = extractValue(response);

          set((state: any) => ({
            users: state.users.map(
              (user: any) => (user.id === userData.id ? updatedUser : user) // Complete replacement
            ),
          }));
          console.log("Updated user:", updatedUser);
          return updatedUser;
        },

        toggleUser: async (id: any) => {
          await apiService.put(apiRoutes.users.toggle(id));

          // Update the user's isDisabled status by toggling it
          set((state: any) => ({
            users: state.users.map((u: any) => {
              if (u.id === id) {
                const newStatus = !u.isDisabled;
                return { ...u, isDisabled: newStatus };
              }
              return u;
            }),
          }));
        },
        // Fixed unLockUser method in useUserStore.js

        unLockUser: async (id: any) => {
          await apiService.put(apiRoutes.users.unlock(id));

          // Update the user's lock status (not disabled status)
          set((state: any) => ({
            users: state.users.map((user: any) =>
              user.id === id
                ? {
                    ...user,
                    isLocked: false, // ✅ Fixed: unlock sets isLocked to false
                  }
                : user
            ),
          }));
        },
        revokeToken: async (refreshToken: any) => {
          await apiService.put(apiRoutes.users.revoke(refreshToken));
        },

        deleteUser: async (id: any) => {
          await apiService.delete(apiRoutes.users.delete(id));

          set((state: any) => ({
            users: state.users.filter((user: any) => user.id !== id),
          }));
        },

        resetUserData: () =>
          set({
            users: [],
            error: null,
          }),
      }),
      {
        name: "user-storage",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);

export default useUserStore;
