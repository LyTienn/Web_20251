import React, { useState, useEffect } from 'react';
import { Download, Plus, Users as UsersIcon, Library, UserPlus, MessageSquare, Crown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminStatsService from '../../service/AdminStatsService';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [subjectStats, setSubjectStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [registrationData, setRegistrationData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, subjectRes, usersRes, commentsRes, regRes] = await Promise.all([
          AdminStatsService.getDashboardStats(),
          AdminStatsService.getBooksBySubject(),
          AdminStatsService.getRecentUsers(5),
          AdminStatsService.getRecentComments(5),
          AdminStatsService.getRegistrationStats(30)
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (subjectRes.success) setSubjectStats(subjectRes.data);
        if (usersRes.success) setRecentUsers(usersRes.data.users);
        if (commentsRes.success) setRecentComments(commentsRes.data.comments);
        if (regRes.success) setRegistrationData(regRes.data.registrations);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const exportReport = () => {
    // Prepare data for CSV
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN');
    const timeStr = now.toLocaleTimeString('vi-VN');

    let csvContent = "";

    // Header
    csvContent += "BÁO CÁO TỔNG QUAN HỆ THỐNG\n";
    csvContent += `Ngày xuất: ${dateStr} ${timeStr}\n\n`;

    // User Stats
    csvContent += "=== THỐNG KÊ NGƯỜI DÙNG ===\n";
    csvContent += `Tổng số thành viên,${stats?.users?.total || 0}\n`;
    csvContent += `Thành viên Premium,${stats?.users?.premium || 0}\n`;
    csvContent += `Thành viên Free,${stats?.users?.free || 0}\n`;
    csvContent += `Đăng ký mới 24h,${stats?.users?.newLast24h || 0}\n`;
    csvContent += `Đăng ký mới 7 ngày,${stats?.users?.newLastWeek || 0}\n\n`;

    // Book Stats
    csvContent += "=== THỐNG KÊ SÁCH ===\n";
    csvContent += `Tổng số sách,${stats?.books?.total || 0}\n`;
    csvContent += `Sách Premium,${stats?.books?.premium || 0}\n`;
    csvContent += `Sách Free,${stats?.books?.free || 0}\n\n`;

    // Comment Stats
    csvContent += "=== THỐNG KÊ BÌNH LUẬN ===\n";
    csvContent += `Tổng số bình luận,${stats?.comments?.total || 0}\n\n`;

    // Registration Trend
    if (registrationData.length > 0) {
      csvContent += "=== XU HƯỚNG ĐĂNG KÝ (30 NGÀY) ===\n";
      csvContent += "Ngày,Số lượng đăng ký\n";
      registrationData.forEach(item => {
        csvContent += `${item.date},${item.count}\n`;
      });
      csvContent += "\n";
    }

    // Subject Distribution
    if (subjectStats?.distribution?.length > 0) {
      csvContent += "=== PHÂN BỔ DANH MỤC SÁCH ===\n";
      csvContent += "Thể loại,Số lượng,Phần trăm\n";
      subjectStats.distribution.forEach(item => {
        csvContent += `${item.name},${item.count},${item.percent}%\n`;
      });
      csvContent += "\n";
    }

    // Recent Users
    if (recentUsers.length > 0) {
      csvContent += "=== THÀNH VIÊN MỚI NHẤT ===\n";
      csvContent += "Tên,Email,Ngày đăng ký,Gói\n";
      recentUsers.forEach(user => {
        csvContent += `${user.full_name || 'Chưa đặt tên'},${user.email},${formatDate(user.created_at)},${user.tier}\n`;
      });
    }

    // Create Blob with BOM for proper UTF-8 encoding in Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bao-cao-he-thong_${now.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsCards = [
    {
      iconBg: 'bg-blue-50 dark:bg-blue-500/10',
      icon: <UsersIcon className="text-primary" size={20} />,
      title: 'Tổng thành viên',
      value: stats?.users?.total?.toLocaleString() || '0',
      note: `${stats?.users?.premium || 0} Premium · ${stats?.users?.free || 0} Free`,
      badge: stats?.users?.newLast24h > 0 ? `+${stats.users.newLast24h} hôm nay` : 'Không có mới',
      badgeColor: stats?.users?.newLast24h > 0
        ? 'text-green-500 bg-green-50 dark:bg-green-500/10'
        : 'text-slate-500 bg-slate-50 dark:bg-slate-500/10'
    },
    {
      iconBg: 'bg-purple-50 dark:bg-purple-500/10',
      icon: <Library className="text-purple-500" size={20} />,
      title: 'Tổng đầu sách',
      value: stats?.books?.total?.toLocaleString() || '0',
      note: `${stats?.books?.premium || 0} Premium · ${stats?.books?.free || 0} Free`,
      badge: 'Thư viện',
      badgeColor: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10'
    },
    {
      iconBg: 'bg-orange-50 dark:bg-orange-500/10',
      icon: <UserPlus className="text-orange-500" size={20} />,
      title: 'Đăng ký mới (7 ngày)',
      value: `+${stats?.users?.newLastWeek || 0}`,
      note: 'Thành viên mới trong tuần',
      badge: stats?.users?.newLast24h > 0 ? `+${stats.users.newLast24h} (24h)` : '0 (24h)',
      badgeColor: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10'
    },
    {
      iconBg: 'bg-teal-50 dark:bg-teal-500/10',
      icon: <MessageSquare className="text-teal-500" size={20} />,
      title: 'Tổng bình luận',
      value: stats?.comments?.total?.toLocaleString() || '0',
      note: 'Đánh giá từ người đọc',
      badge: 'Reviews',
      badgeColor: 'text-teal-500 bg-teal-50 dark:bg-teal-500/10'
    }
  ];

  const subjectColors = [
    'bg-blue-600',
    'bg-purple-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500'
  ];

  const generateChartPath = () => {
    if (!registrationData.length) return { line: '', area: '' };

    const maxCount = Math.max(...registrationData.map(d => parseInt(d.count) || 0), 1);
    const width = 800;
    const height = 250;
    const paddingLeft = 60; // Increased padding for Y-axis labels
    const paddingRight = 20;
    const paddingY = 25;

    const points = registrationData.map((d, i) => {
      // Calculate X based on available width after padding
      const availableWidth = width - paddingLeft - paddingRight;
      const x = paddingLeft + (i / (registrationData.length - 1 || 1)) * availableWidth;

      // Calculate Y based on available height
      const availableHeight = height - (paddingY * 2);
      const y = height - paddingY - ((parseInt(d.count) || 0) / maxCount) * availableHeight;
      return { x, y };
    });

    if (points.length === 0) return { line: '', area: '' };
    if (points.length === 1) {
      return {
        line: `M${points[0].x},${points[0].y}`,
        area: `M${points[0].x},${height - paddingY} L${points[0].x},${points[0].y} L${points[0].x},${height - paddingY} Z`
      };
    }

    let linePath = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
      const cp1y = points[i - 1].y;
      const cp2x = points[i].x - (points[i].x - points[i - 1].x) / 3;
      const cp2y = points[i].y;
      linePath += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i].x},${points[i].y}`;
    }

    const areaPath = linePath + ` L${points[points.length - 1].x},${height - paddingY} L${points[0].x},${height - paddingY} Z`;

    return { line: linePath, area: areaPath };
  };

  const { line: chartLine, area: chartArea } = generateChartPath();
  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Chào mừng trở lại, Admin
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Tổng quan số liệu và báo cáo hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-white dark:bg-[#1C252E] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            <span>Xuất báo cáo</span>
          </button>
          <Link to="/admin/books" state={{ openAddModal: true }} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <Plus size={18} />
            <span>Thêm sách mới</span>
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((c, idx) => (
          <div key={idx} className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1">
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 ${c.iconBg} rounded-lg`}>
                {c.icon}
              </div>
              <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${c.badgeColor}`}>{c.badge}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{c.title}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{c.value}</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{c.note}</p>
          </div>
        ))}
      </div>

      {/* Chart and categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Xu hướng đăng ký</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Thống kê 30 ngày gần nhất</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Tổng: </span>
              <span className="font-semibold text-primary">
                {registrationData.reduce((sum, d) => sum + parseInt(d.count || 0), 0)} đăng ký
              </span>
            </div>
          </div>
          <div className="relative w-full aspect-[2/1] max-h-[300px]">
            {/* Chart Container */}
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 300">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#137fec" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#137fec" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines and Labels */}
              {/* Grid Lines and Labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const availableHeight = 250 - (25 * 2); // paddingY = 25
                const y = 250 - 25 - (ratio * availableHeight);
                return (
                  <g key={ratio}>
                    {/* Horizontal Grid Line */}
                    <line
                      stroke="#334155"
                      strokeDasharray="4 4"
                      strokeOpacity="0.1"
                      x1="65" // Padding Left + 5
                      x2="800"
                      y1={y}
                      y2={y}
                    />
                    {/* Y-axis Label */}
                    <text
                      x="55"
                      y={y + 5} // Optical centering
                      textAnchor="end"
                      fontSize="12"
                      fill="#94a3b8"
                      fontWeight="500"
                    >
                      {Math.round(ratio * (Math.max(...registrationData.map(d => parseInt(d.count) || 0), 1)))}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis Title */}
              <text x="10" y="20" fontSize="14" fill="#64748b" fontWeight="bold">SL</text>

              {chartArea && <path d={chartArea} fill="url(#chartGradient)" />}
              {chartLine && <path d={chartLine} fill="none" stroke="#137fec" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />}
            </svg>
            {registrationData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                Chưa có dữ liệu đăng ký
              </div>
            )}
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium">
            {registrationData.length > 0 ? (
              <>
                <span>{formatDate(registrationData[0]?.date)}</span>
                <span>{formatDate(registrationData[Math.floor(registrationData.length / 2)]?.date)}</span>
                <span>{formatDate(registrationData[registrationData.length - 1]?.date)}</span>
              </>
            ) : (
              <>
                <span>Tuần 1</span>
                <span>Tuần 2</span>
                <span>Tuần 3</span>
                <span>Tuần 4</span>
              </>
            )}
          </div>
        </div>

        {/* Subject distribution */}
        <div className="lg:col-span-1 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Phân bổ danh mục</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Các thể loại sách phổ biến</p>
          </div>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[280px]">
            {subjectStats?.distribution?.slice(0, 6).map((item, idx) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate mr-2">{item.name}</span>
                  <span className="text-slate-500 whitespace-nowrap">{item.count} ({item.percent}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${subjectColors[idx % subjectColors.length]} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(item.percent, 2)}%` }}
                  />
                </div>
              </div>
            ))}
            {(!subjectStats?.distribution || subjectStats.distribution.length === 0) && (
              <div className="text-center text-slate-400 py-8">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      {/* Members + comments blocks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Thành viên mới</h3>
            <Link to="/admin/users" className="text-sm text-primary font-medium hover:underline">Xem tất cả</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-6 py-4">Tên người dùng</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Ngày đăng ký</th>
                  <th className="px-6 py-4 text-center">Gói</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {recentUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                          {getInitials(user.full_name)}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {user.full_name || 'Chưa đặt tên'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.tier === 'PREMIUM'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                        {user.tier === 'PREMIUM' && <Crown size={12} />}
                        {user.tier}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      Chưa có thành viên nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent comments */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Bình luận gần đây</h3>
            <span className="bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 text-xs font-bold px-2 py-1 rounded">
              {stats?.comments?.total || 0} tổng
            </span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[300px] p-0">
            {recentComments.map((comment) => (
              <div key={comment.comment_id} className="p-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-900 dark:text-white">
                      {comment.user_name || 'Ẩn danh'}
                    </span>
                    <span className="text-xs text-slate-500">• Sách: "{comment.book_title}"</span>
                  </div>
                  <span className="text-xs text-slate-400">{getTimeAgo(comment.created_at)}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{comment.content}</p>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= comment.rating ? 'text-yellow-400' : 'text-slate-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
            {recentComments.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                Chưa có bình luận nào
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
