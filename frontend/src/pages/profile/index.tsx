import { FC } from "react";
import ProfileSettings from "./settings";
import Account from "./account";

const ProfileTab: FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#9A61B0] mb-2">
          Profile & Settings
        </h2>
        <p className="text-gray-600">
          Manage your account, preferences, and personal information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-6">
          <h3 className="text-xl font-semibold text-[#9A61B0] mb-4">
            Profile Settings
          </h3>
          <ProfileSettings />
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-6">
          <h3 className="text-xl font-semibold text-[#9A61B0] mb-4">
            Account Information
          </h3>
          <Account />
        </div>
      </div>
    </div>
  );
};

export default ProfileTab; 