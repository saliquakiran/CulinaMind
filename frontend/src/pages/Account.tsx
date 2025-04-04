import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../utils/api";
import { toast } from "react-toastify";

const Account = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    // Fetch user profile when the component mounts
    const fetchUserProfile = async () => {
      try {
        const profileData = await getUserProfile();
        setFirstName(profileData.first_name);
        setLastName(profileData.last_name);
      } catch (error) {
        toast.error("Failed to load user profile.");
      }
    };
    fetchUserProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(firstName, lastName);
      toast.success("Profile updated successfully!");
      setIsEditing(false); // Stop editing after saving
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="bg-[#C7AAF4] min-h-screen flex flex-col items-center w-full p-6">
      {/* Account Container */}
      <div className="bg-gray-200 w-full max-w-4xl p-8 rounded-lg shadow-lg">
        {/* Account Header */}
        <h1 className="text-4xl font-bold mb-8 text-black">Account</h1>

        {/* First Name Row */}
        <div className="mb-6">
          <label className="text-lg font-semibold text-black block mb-2">
            First Name
          </label>
          <div className="flex items-center">
            {isEditing ? (
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="flex-grow p-3 rounded-lg border border-gray-300 text-lg bg-white"
              />
            ) : (
              <span className="flex-grow p-3 rounded-lg bg-white text-lg">
                {firstName}
              </span>
            )}
          </div>
        </div>

        {/* Last Name Row */}
        <div>
          <label className="text-lg font-semibold text-black block mb-2">
            Last Name
          </label>
          <div className="flex items-center">
            {isEditing ? (
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="flex-grow p-3 rounded-lg border border-gray-300 text-lg bg-white"
              />
            ) : (
              <span className="flex-grow p-3 rounded-lg bg-white text-lg">
                {lastName}
              </span>
            )}
          </div>
        </div>

        {/* Edit and Save Button */}
        <div className="mt-6">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
