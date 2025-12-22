// app/settings/page.tsx or src/pages/settings.tsx
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const { user, logout, deleteAcc } = useAuth();

  return (
    <div className="h-screen bg-background text-foreground">
      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Account Info */}
        <section id="account" className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Account Info
          </h3>

          <div className="space-y-2">
            {/* Full Name */}
            <div>
              <button className="text-sm text-muted-foreground inline-flex items-center gap-2 p-2 rounded-lg">
                <User />
                <span className="text-base">{user.full_name}</span>
              </button>
            </div>

            {/* Email */}
            <div>
              <button className="text-sm text-muted-foreground inline-flex items-center gap-2 p-2 rounded-lg">
                <Mail className="h-4 w-5" />
                <span className="text-base">{user.email}</span>
              </button>
            </div>

            {/* Phone */}
            <div>
              <button className="text-sm text-muted-foreground inline-flex items-center gap-2 p-2 rounded-lg">
                <Phone className="h-4 w-5" />
                <span className="text-base">
                  {user.phone_number || "nill"}
                </span>
              </button>
            </div>

            {/* Upgrade */}
            <div>
              <button className="text-sm text-muted-foreground inline-flex items-center gap-2 hover:bg-muted/50 p-2 rounded-lg">
                <Shield className="h-5 w-5" />
                <span className="text-base">Upgrade to Pro</span>
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="text-sm text-muted-foreground inline-flex items-center gap-2 hover:bg-muted/50 p-2 rounded-lg hover:bg-red-600 hover:text-red-400"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                <LogOut className="h-4 w-4" />
                Log out
              </h3>
            </button>
          </div>
        </section>

        {/* Logout Info */}
        <section className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Log out of your account. You can log back in anytime.
          </p>

          <hr />

          {/* Danger Zone */}
          <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Danger Zone
          </h3>

          <p className="text-sm text-muted-foreground">
            Delete your account permanently. This action cannot be undone.
          </p>

          <button
            onClick={deleteAcc}
            className="text-red-100 px-2 py-1 text-sm bg-red-900 rounded-sm"
          >
            Delete Account
          </button>
        </section>
      </main>
    </div>
  );
}
