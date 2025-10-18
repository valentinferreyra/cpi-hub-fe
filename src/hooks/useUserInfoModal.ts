import { useState } from "react";
import { getUserById } from "@/api";
import type { User } from "@/types/user";

export const useUserInfoModal = () => {
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
  const [viewedUser, setViewedUser] = useState<User | null>(null);

  const handleUserClick = async (userId: number) => {
    setShowUserInfoModal(true);
    setIsLoadingUserInfo(true);
    setViewedUser(null);
    try {
      const user = await getUserById(userId);
      setViewedUser(user);
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setIsLoadingUserInfo(false);
    }
  };

  const closeModal = () => {
    setShowUserInfoModal(false);
    setViewedUser(null);
    setIsLoadingUserInfo(false);
  };

  return {
    showUserInfoModal,
    isLoadingUserInfo,
    viewedUser,
    handleUserClick,
    closeModal,
  };
};
