"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  API_BASE_URL,
  fetchJson,
  getStoredUser,
  normalizeRole,
  withActorHeaders,
} from "../shared/campusApi";
import {
  GlassPanel,
  MetricTile,
  PageHero,
  SectionHeading,
  SiteFrame,
} from "../shared/SiteFrame";

type ProfileUser = {
  email: string;
  fullName: string;
  profilePhotoUrl?: string | null;
  role: "USER" | "ADMIN" | "TECHNICIAN";
  phoneNumber: string;
  address?: string | null;
  department: string;
  preferredContactMethod?: string | null;
  joinedDate?: string | null;
  status?: string | null;
  provider?: string | null;
  notificationEnabled?: boolean;
  googleConnected: boolean;
  githubConnected: boolean;
  localPasswordEnabled: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("0");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState("EMAIL");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function sanitizePhoneInput(value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      return "0";
    }

    const withLeadingZero = digits.startsWith("0") ? digits : `0${digits}`;
    return withLeadingZero.slice(0, 10);
  }

  const joinedDateText = useMemo(() => {
    if (!user?.joinedDate) {
      return "N/A";
    }
    return new Date(user.joinedDate).toLocaleDateString();
  }, [user?.joinedDate]);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const profile = await fetchJson<ProfileUser>(`${API_BASE_URL}/profile`, withActorHeaders());
        if (!mounted) {
          return;
        }

        const normalized: ProfileUser = {
          ...profile,
          role: normalizeRole(profile.role),
          status: profile.status || "ACTIVE",
          preferredContactMethod: profile.preferredContactMethod || "EMAIL",
        };

        setUser(normalized);
        setPhoneNumber(sanitizePhoneInput(normalized.phoneNumber || ""));
        setAddress(normalized.address || "");
        setDepartment(normalized.department || "");
        setPreferredContactMethod((normalized.preferredContactMethod || "EMAIL").toUpperCase());
        setProfilePhotoUrl(normalized.profilePhotoUrl || "");
        setNotificationEnabled(normalized.notificationEnabled ?? true);
      } catch (caught) {
        if (!mounted) {
          return;
        }
        setError(caught instanceof Error ? caught.message : "Failed to load profile.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSaveProfile() {
    setSaving(true);
    setError("");
    setMessage("");

    const sanitizedPhoneNumber = sanitizePhoneInput(phoneNumber);
    if (!sanitizedPhoneNumber.startsWith("0")) {
      setSaving(false);
      setError("Phone number must start with 0.");
      return;
    }

    if (sanitizedPhoneNumber.length !== 10) {
      setSaving(false);
      setError("Phone number must contain exactly 10 digits and start with 0.");
      return;
    }

    try {
      const updated = await fetchJson<ProfileUser>(
        `${API_BASE_URL}/profile`,
        withActorHeaders({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: sanitizedPhoneNumber,
            address,
            department,
            preferredContactMethod,
            profilePhotoUrl,
            notificationEnabled,
          }),
        })
      );

      const normalized: ProfileUser = {
        ...updated,
        role: normalizeRole(updated.role),
        status: updated.status || "ACTIVE",
      };

      setUser(normalized);
      setMessage("Profile updated successfully.");

      const stored = getStoredUser();
      if (stored) {
        window.localStorage.setItem(
          "smartcampusUser",
          JSON.stringify({
            ...stored,
            email: normalized.email,
            fullName: normalized.fullName,
            role: normalized.role,
          })
        );
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadPhoto() {
    if (!photoFile) {
      setError("Please choose a photo file first.");
      return;
    }

    setUploadingPhoto(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", photoFile);

      const response = await fetch(
        `${API_BASE_URL}/profile/photo`,
        withActorHeaders({
          method: "POST",
          body: formData,
        })
      );

      const data = (await response.json()) as { message?: string; profilePhotoUrl?: string };
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload profile photo.");
      }

      const uploadedUrl = data.profilePhotoUrl || "";
      if (uploadedUrl) {
        setProfilePhotoUrl(uploadedUrl);
        setUser((prev) => (prev ? { ...prev, profilePhotoUrl: uploadedUrl } : prev));
      }

      setPhotoFile(null);
      setMessage(data.message || "Profile photo uploaded successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to upload profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleChangePassword() {
    setChangingPassword(true);
    setError("");
    setMessage("");

    try {
      const result = await fetchJson<{ message: string }>(
        `${API_BASE_URL}/profile/change-password`,
        withActorHeaders({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        })
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage(result.message || "Password changed successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Delete your account permanently? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      await fetchJson<{ message: string }>(
        `${API_BASE_URL}/profile`,
        withActorHeaders({ method: "DELETE" })
      );

      window.localStorage.removeItem("smartcampusUser");
      router.push("/Component/Login");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to delete account.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SiteFrame accent="amber">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <PageHero
          eyebrow="Profile"
          title={user ? `${user.fullName || "Campus User"} profile` : "Profile"}
          description="OAuth handles authentication. This profile area handles your campus-specific account data, role context, and account controls."
          aside={
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-orange-600">Status</p>
                <p className="mt-3 text-3xl font-semibold">{user?.status || "ACTIVE"}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-orange-600">Joined Date</p>
                <p className="mt-3 text-lg font-semibold">{joinedDateText}</p>
              </div>
            </div>
          }
        />

        {message ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-4">
          <MetricTile label="Full Name" value={user?.fullName || "N/A"} detail="Account display identity" />
          <MetricTile label="Email" value={user?.email || "N/A"} detail="Primary auth identity" />
          <MetricTile label="Role" value={user?.role || "USER"} detail="Permission level" />
          <MetricTile label="Department" value={user?.department || "N/A"} detail="Campus unit" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <GlassPanel>
            <SectionHeading
              eyebrow="View Profile"
              title="Core account information"
              description="This section gives clear, viva-ready visibility into app-level profile fields beyond OAuth authentication."
            />

            {loading ? (
              <p className="mt-5 text-sm text-stone-600">Loading profile...</p>
            ) : user ? (
              <div className="mt-6 grid gap-4">
                <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white/70 p-4">
                  {user.profilePhotoUrl ? (
                    <img
                      src={user.profilePhotoUrl}
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-200 text-xl font-semibold text-stone-700">
                      {user.fullName?.trim()?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Profile Photo</p>
                    <p className="text-sm text-stone-700">Displayed in personal identity area</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white/70 p-4 text-sm text-stone-700">
                  <p><span className="font-semibold">Phone:</span> {user.phoneNumber || "N/A"}</p>
                  <p><span className="font-semibold">Address:</span> {user.address || "N/A"}</p>
                  <p><span className="font-semibold">Preferred Contact:</span> {user.preferredContactMethod || "EMAIL"}</p>
                  <p><span className="font-semibold">Provider:</span> {user.provider || "LOCAL"}</p>
                </div>
              </div>
            ) : null}
          </GlassPanel>

          <GlassPanel>
            <SectionHeading
              eyebrow="Edit Profile"
              title="Update your own details"
              description="Users can update phone number, address, department, and preferred contact method."
            />

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Phone Number
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(sanitizePhoneInput(event.target.value))}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  placeholder="Phone number"
                  inputMode="numeric"
                  maxLength={10}
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Address
                <input
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  placeholder="Address"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Department
                <input
                  type="text"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  placeholder="Department"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Preferred Contact Method
                <select
                  value={preferredContactMethod}
                  onChange={(event) => setPreferredContactMethod(event.target.value)}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                >
                  <option value="EMAIL">EMAIL</option>
                  <option value="PHONE">PHONE</option>
                  <option value="WHATSAPP">WHATSAPP</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Profile Photo URL
                <input
                  type="url"
                  value={profilePhotoUrl}
                  onChange={(event) => setProfilePhotoUrl(event.target.value)}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  placeholder="https://..."
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Upload Profile Photo (from PC)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <button
                type="button"
                onClick={() => void handleUploadPhoto()}
                disabled={uploadingPhoto || !photoFile || saving || loading || deleting}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {uploadingPhoto ? "Uploading..." : "Upload Selected Photo"}
              </button>

              <label className="inline-flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700">
                <input
                  type="checkbox"
                  checked={notificationEnabled}
                  onChange={(event) => setNotificationEnabled(event.target.checked)}
                />
                Notification Enabled
              </label>

              <button
                type="button"
                onClick={() => void handleSaveProfile()}
                disabled={saving || loading || deleting}
                className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#d97706,#b45309)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </GlassPanel>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Connected Accounts"
              title="Authentication providers"
              description="A clear section to demonstrate OAuth connectivity in viva."
            />

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-stone-200 bg-white/75 p-4 text-sm text-stone-700">
                {user?.googleConnected ? "✓ Google Connected" : "Google Not Connected"}
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white/75 p-4 text-sm text-stone-700">
                {user?.githubConnected ? "✓ GitHub Connected" : "GitHub Not Connected"}
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white/75 p-4 text-sm text-stone-700">
                Connected via {user?.provider || "LOCAL"}
              </div>
            </div>
          </GlassPanel>

          <GlassPanel>
            <SectionHeading
              eyebrow="Security"
              title="Password and account control"
              description="Change password appears only for local accounts. Account deactivation is handled by admins."
            />

            {user?.localPasswordEnabled ? (
              <div className="mt-6 grid gap-3">
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Current Password
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  New Password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Confirm Password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void handleChangePassword()}
                  disabled={changingPassword || saving || loading || deleting}
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {changingPassword ? "Updating..." : "Change Password"}
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-stone-200 bg-white/75 p-4 text-sm text-stone-700">
                Signed in using {user?.provider || "OAuth"} authentication. Password is managed by the provider.
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-1">
              <button
                type="button"
                onClick={() => void handleDeleteAccount()}
                disabled={deleting || saving || loading || changingPassword}
                className="inline-flex items-center justify-center rounded-full border border-red-300 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </GlassPanel>
        </section>
      </div>
    </SiteFrame>
  );
}
