"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const avatars = ["/avatars/avatar1.png", "/avatars/avatar2.png", "/avatars/avatar3.png", "/avatars/avatar4.png"];

const subscriptionPlans = {
  low: { label: "Low Budget", price: 10 },
  medium: { label: "Medium Budget", price: 20 },
  high: { label: "High Budget", price: 30 },
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [agreeToPay, setAgreeToPay] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/register");
      return;
    }

    fetch("http://localhost:5000/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((userData) => {
        if (userData.error) {
          setError(userData.error);
          return;
        }
        setUser(userData.user);
        setUpdatedUser(userData.user);
        setSelectedAvatar(userData.user.avatar ? `/avatars/${userData.user.avatar}` : avatars[0]);
        setSelectedPlan(userData.user.subscriptionPlan || "");
      })
      .catch(() => setError("⚠ Failed to load profile data"));
  }, [router]);

  const handleInputChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleSubscriptionChange = () => {
    const newSubscription = !updatedUser.subscription;
    setUpdatedUser({ ...updatedUser, subscription: newSubscription });

    if (!newSubscription) {
      setSelectedPlan("");
      setAgreeToPay(false);
    }
  };

  const handleSaveChanges = () => {
    if (updatedUser.subscription && !selectedPlan) {
      setError("⚠ Please select a subscription plan.");
      return;
    }
  
    if (updatedUser.subscription && !agreeToPay) {
      setError("⚠ You must agree to pay the selected amount.");
      return;
    }
  
    const payload = {
      name: updatedUser.name,
      age: updatedUser.age,
      grade: updatedUser.grade,
      avatar: selectedAvatar.split("/").pop(),
    };
  
    fetch("http://localhost:5000/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.error || "Failed to update profile");
          });
        }
        return res.json();
      })
      .then((data) => {
        setUser({ ...updatedUser, avatar: selectedAvatar });
        setEditMode(false);
        setError(""); // Clear any previous errors
      })
      .catch((error) => {
        console.error("Profile update error:", error);
        setError(error.message || "⚠ Failed to update profile");
      });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setUpdatedUser(user);
    setSelectedPlan(user?.subscriptionPlan || "");
    setAgreeToPay(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/register");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-purple-200 via-pink-100 to-yellow-100 p-6">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-4">
        ✨ My Awesome Profile ✨
      </h1>

      {error && (
        <p className="text-white mt-2 bg-red-400 p-3 rounded-lg border-2 border-red-500 animate-bounce">{error}</p>
      )}

      {user ? (
        <div className="bg-white shadow-xl rounded-2xl p-8 mt-6 w-96 border-4 border-yellow-400">
          <div className="flex flex-col items-center">
            {/* Avatar Display */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-pulse"></div>
              <img
                src={selectedAvatar || "/placeholder.svg"}
                alt="User Avatar"
                className="relative w-28 h-28 rounded-full border-4 border-white"
                onError={(e) => (e.target.src = "/avatars/default-avatar.png")}
              />
            </div>

            {/* Name Section */}
            <div className="mt-6 bg-purple-100 p-4 rounded-xl w-full">
              <label className="block font-bold text-purple-600">📝 Name:</label>
              {editMode ? (
                <input
                  type="text"
                  name="name"
                  value={updatedUser?.name || ""}
                  onChange={handleInputChange}
                  className="border-2 border-purple-300 p-2 w-full rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              ) : (
                <p className="text-lg font-medium text-purple-700">{user?.name || "No Name"}</p>
              )}
            </div>

            <p className="text-pink-500 font-medium mt-2">{user?.email || "No Email"}</p>
          </div>

          {/* Avatar Selection */}
          {editMode && (
            <div className="mt-6 bg-yellow-100 p-4 rounded-xl">
              <label className="block font-bold text-purple-600">🖼 Choose Your Avatar:</label>
              <div className="flex space-x-4 mt-2 justify-center">
                {avatars.map((avatar, index) => (
                  <div
                    key={index}
                    className={`transform transition-all duration-200 hover:scale-110 ${
                      selectedAvatar === avatar ? "scale-110" : ""
                    }`}
                  >
                    <img
                      src={avatar || "/placeholder.svg"}
                      alt={`Avatar ${index + 1}`}
                      className={`w-16 h-16 rounded-full cursor-pointer border-4 ${
                        selectedAvatar === avatar
                          ? "border-green-400 shadow-lg shadow-green-200"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => setSelectedAvatar(avatar)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 bg-blue-100 p-4 rounded-xl">
            <label className="block font-bold text-blue-600">📚 Grade:</label>
            {editMode ? (
              <input
                type="number"
                name="grade"
                value={updatedUser?.grade || ""}
                onChange={handleInputChange}
                className="border-2 border-blue-300 p-2 w-full rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            ) : (
              <p className="text-lg font-medium text-blue-700">{user?.grade || "Not Available"}</p>
            )}
          </div>

          <div className="mt-4 bg-green-100 p-4 rounded-xl">
            <label className="block font-bold text-green-600">🎂 Age:</label>
            {editMode ? (
              <input
                type="number"
                name="age"
                value={updatedUser?.age || ""}
                onChange={handleInputChange}
                className="border-2 border-green-300 p-2 w-full rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            ) : (
              <p className="text-lg font-medium text-green-700">{user?.age || "Not Available"}</p>
            )}
          </div>

          {/* Subscription Option */}
          <div className="mt-6 bg-orange-100 p-4 rounded-xl">
            <label className="block font-bold text-orange-600">💫 Super Powers:</label>
            {editMode ? (
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="subscription"
                    checked={updatedUser?.subscription || false}
                    onChange={handleSubscriptionChange}
                    className="w-5 h-5 mr-3 accent-orange-500"
                  />
                  <span className="text-lg font-medium text-orange-700">
                    {updatedUser?.subscription ? "Activated! 🚀" : "Not Activated 😴"}
                  </span>
                </div>

                {updatedUser.subscription && (
                  <div className="mt-4">
                    <label className="block font-bold text-orange-600">📦 Select Plan:</label>
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="border-2 border-orange-300 p-2 w-full rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                    >
                      <option value="">Choose...</option>
                      {Object.entries(subscriptionPlans).map(([key, plan]) => (
                        <option key={key} value={key}>
                          {plan.label} - ${plan.price}/month
                        </option>
                      ))}
                    </select>

                    {selectedPlan && (
                      <div className="mt-4 flex items-center">
                        <input
                          type="checkbox"
                          checked={agreeToPay}
                          onChange={() => setAgreeToPay(!agreeToPay)}
                          className="w-5 h-5 mr-3 accent-orange-500"
                        />
                        <span className="text-lg font-medium text-orange-700">
                          ✅ I agree to pay ${subscriptionPlans[selectedPlan].price}/month
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-lg font-medium text-orange-700">
                {user?.subscription ? `Activated! 🚀 (${user.subscriptionPlan})` : "Not Activated 😴"}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-between">
            {editMode ? (
              <>
                <button
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                  onClick={handleSaveChanges}
                >
                  💾 Save Changes
                </button>
                <button
                  className="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                  onClick={handleCancelEdit}
                >
                  ❌ Cancel
                </button>
              </>
            ) : (
              <button
                className="bg-gradient-to-r from-blue-400 to-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                onClick={() => setEditMode(true)}
              >
                ✏️ Edit Profile
              </button>
            )}

            <button
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
              onClick={() => router.push("/home")}
            >
              🏠 Home
            </button>
          </div>

          {/* Logout Button */}
          <div className="mt-8 flex justify-center">
            <button
              className="bg-gradient-to-r from-red-400 to-pink-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transform transition-all duration-300 
                       hover:scale-105 hover:shadow-xl active:scale-95"
              onClick={handleLogout}
            >
              👋 Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-xl border-4 border-yellow-400 mt-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-purple-500 animate-bounce"></div>
            <div className="w-8 h-8 rounded-full bg-pink-500 animate-bounce delay-100"></div>
            <div className="w-8 h-8 rounded-full bg-blue-500 animate-bounce delay-200"></div>
            <p className="text-xl font-bold text-purple-600">Loading Your Profile...</p>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="fixed top-10 left-10 w-16 h-16 rounded-full bg-yellow-300 opacity-70 animate-pulse"></div>
      <div className="fixed bottom-10 right-10 w-20 h-20 rounded-full bg-pink-300 opacity-70 animate-pulse"></div>
      <div className="fixed top-20 right-20 w-12 h-12 rounded-full bg-blue-300 opacity-70 animate-pulse"></div>
      <div className="fixed bottom-20 left-20 w-14 h-14 rounded-full bg-purple-300 opacity-70 animate-pulse"></div>
    </div>
  );
}
