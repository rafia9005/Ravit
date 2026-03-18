import { Settings, User, Bell, Lock, Palette, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Edit Profile",
          description: "Update your name, bio, and avatar",
          path: "/settings/profile",
        },
        {
          icon: Lock,
          label: "Password & Security",
          description: "Manage your password and security settings",
          path: "/settings/security",
          comingSoon: true,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          description: "Manage your notification preferences",
          path: "/settings/notifications",
          comingSoon: true,
        },
        {
          icon: Palette,
          label: "Appearance",
          description: "Customize theme and display settings",
          path: "/settings/appearance",
          comingSoon: true,
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          icon: Info,
          label: "About Ravit",
          description: "Version, terms, and privacy policy",
          path: "/settings/about",
          comingSoon: true,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6" />
          <h2 className="text-xl font-bold tracking-tight">Settings</h2>
        </div>
      </header>

      {/* Settings List */}
      <div className="flex flex-col">
        {settingsSections.map((section) => (
          <div key={section.title} className="border-b">
            <h3 className="px-4 py-3 text-sm font-semibold text-muted-foreground">
              {section.title}
            </h3>
            <div className="divide-y">
              {section.items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => !item.comingSoon && navigate(item.path)}
                  disabled={item.comingSoon}
                  className="w-full px-4 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.label}</p>
                      {item.comingSoon && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
