import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, MessageCircle, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user, fetchUser, isLoading } = useAuth();

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  const stats = [
    {
      title: "Karya Saya",
      value: "0",
      description: "Jumlah publikasi",
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      title: "Pembaca",
      value: "0",
      description: "Total pembaca",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Interaksi",
      value: "0",
      description: "Komentar dan like",
      icon: MessageCircle,
      color: "bg-purple-500",
    },
    {
      title: "Pertumbuhan",
      value: "0%",
      description: "Bulan ini",
      icon: TrendingUp,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="flex-1 space-y-6 md:space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {isLoading ? "Memuat..." : `Selamat datang, ${user?.name || "Penulis"}!`}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Kelola karya Anda dan pantau statistik publikasi di sini
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`${stat.color} rounded-lg p-2 md:p-3 opacity-20 flex-shrink-0`}>
                  <Icon className="h-5 md:h-6 w-5 md:w-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold">Aktivitas Terbaru</h2>
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-center py-8 md:py-12 text-muted-foreground text-sm md:text-base">
            <p>Tidak ada aktivitas terbaru. Mulai buat karya Anda sekarang!</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold">Tindakan Cepat</h2>
        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
          <Card className="p-4 md:p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2 md:p-3 flex-shrink-0">
                <BookOpen className="h-5 md:h-6 w-5 md:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm md:text-base">Buat Karya Baru</p>
                <p className="text-xs md:text-sm text-muted-foreground">Mulai menulis karya Anda</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2 md:p-3 flex-shrink-0">
                <Users className="h-5 md:h-6 w-5 md:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm md:text-base">Jelajahi Komunitas</p>
                <p className="text-xs md:text-sm text-muted-foreground">Temukan penulis lain</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-2 md:p-3 flex-shrink-0">
                <MessageCircle className="h-5 md:h-6 w-5 md:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm md:text-base">Pesan Anda</p>
                <p className="text-xs md:text-sm text-muted-foreground">Baca pesan dari pembaca</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
