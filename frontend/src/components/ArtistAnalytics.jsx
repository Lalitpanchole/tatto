import React, { useMemo } from 'react';
import { 
  Users, Calendar, Clock, TrendingUp, DollarSign, 
  ChevronRight, Award, Activity, BarChart2, FileText, 
  Star, Briefcase, CalendarCheck, CheckCircle, XCircle 
} from 'lucide-react';

export default function ArtistAnalytics({ bookings = [], artists = [], onExport }) {
  // --- Data Processing ---
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const todayStr = today.toISOString().split('T')[0];

  const { 
    thisMonthBookings, 
    upcomingBookings, 
    completedBookings, 
    cancelledBookings,
    artistStats,
    monthlyTrend 
  } = useMemo(() => {
    let thisMonth = [];
    let upcoming = [];
    let completed = [];
    let cancelled = [];
    let stats = {};
    let trend = {}; // { 'YYYY-MM': count }

    // Initialize stats for active artists
    artists.forEach(a => {
      if (a.status === 'Active') {
        stats[a.name] = {
          name: a.name,
          bookingsThisMonth: 0,
          bookedHoursThisMonth: 0,
          upcomingBookings: 0,
          completedBookings: 0,
          lastBookingDate: null,
          totalBookings: 0,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=ff66c4&color=fff&rounded=true&bold=true`
        };
      }
    });

    bookings.forEach(b => {
      const bDate = new Date(b.date);
      const isThisMonth = bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear;
      const isUpcoming = b.date >= todayStr && (b.status === 'Confirmed' || b.status === 'Upcoming');
      const isCompleted = b.status === 'Completed' || (b.date < todayStr && b.status !== 'Cancelled');
      const isCancelled = b.status === 'Cancelled';
      const duration = (Number(b.end) || 0) - (Number(b.start) || 0);
      const monthKey = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}`;

      // Trend
      trend[monthKey] = (trend[monthKey] || 0) + 1;

      if (isThisMonth) thisMonth.push(b);
      if (isUpcoming) upcoming.push(b);
      if (isCompleted) completed.push(b);
      if (isCancelled) cancelled.push(b);

      const artistName = b.artist;
      if (!stats[artistName]) {
        stats[artistName] = {
          name: artistName,
          bookingsThisMonth: 0,
          bookedHoursThisMonth: 0,
          upcomingBookings: 0,
          completedBookings: 0,
          lastBookingDate: null,
          totalBookings: 0,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(artistName)}&background=ff66c4&color=fff&rounded=true&bold=true`
        };
      }

      stats[artistName].totalBookings += 1;

      if (isThisMonth) {
        stats[artistName].bookingsThisMonth += 1;
        stats[artistName].bookedHoursThisMonth += duration;
      }
      if (isUpcoming) stats[artistName].upcomingBookings += 1;
      if (isCompleted) stats[artistName].completedBookings += 1;
      
      if (!stats[artistName].lastBookingDate || b.date > stats[artistName].lastBookingDate) {
        stats[artistName].lastBookingDate = b.date;
      }
    });

    return { 
      thisMonthBookings: thisMonth, 
      upcomingBookings: upcoming, 
      completedBookings: completed, 
      cancelledBookings: cancelled,
      artistStats: Object.values(stats),
      monthlyTrend: Object.entries(trend).sort((a,b) => a[0].localeCompare(b[0])).slice(-6) // Last 6 months
    };
  }, [bookings, artists, currentMonth, currentYear, todayStr]);

  const activeArtistsCount = artists.filter(a => a.status === 'Active').length;
  const totalBookedHours = thisMonthBookings.reduce((sum, b) => sum + ((Number(b.end) || 0) - (Number(b.start) || 0)), 0);

  // Sorting and Top Performers
  const sortedByBookings = [...artistStats].sort((a, b) => b.bookingsThisMonth - a.bookingsThisMonth);
  const topBookings = sortedByBookings[0];
  const sortedByHours = [...artistStats].sort((a, b) => b.bookedHoursThisMonth - a.bookedHoursThisMonth);
  const topHours = sortedByHours[0];
  const sortedByUpcoming = [...artistStats].sort((a, b) => b.upcomingBookings - a.upcomingBookings);
  const topUpcoming = sortedByUpcoming[0];
  const sortedByCompletion = [...artistStats].filter(a => a.totalBookings > 0).sort((a, b) => (b.completedBookings / b.totalBookings) - (a.completedBookings / a.totalBookings));
  const topCompletion = sortedByCompletion[0];

  // Chart Data prep
  const maxArtistBookings = Math.max(...artistStats.map(a => a.bookingsThisMonth), 1);
  const totalStatus = upcomingBookings.length + completedBookings.length + cancelledBookings.length || 1;

  // Empty State check
  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white border border-zinc-200/80 rounded-2xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
          <BarChart2 className="w-8 h-8 text-zinc-300" />
        </div>
        <h3 className="text-sm font-black text-black uppercase tracking-wider mb-2">No Data Available</h3>
        <p className="text-xs text-zinc-500 max-w-sm">No booking data available. Artist analytics will appear here once bookings are recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-black uppercase tracking-wider">Artist Analytics</h3>
          <p className="text-xs text-zinc-450 mt-1 font-sans font-medium">Track and compare booking performance across all artists.</p>
        </div>
        <button
          onClick={onExport}
          className="w-fit self-start sm:self-auto px-4 py-2 bg-zinc-950 hover:bg-studio-pink text-white hover:text-black border border-zinc-900 hover:border-studio-pink font-extrabold text-[9px] tracking-wider uppercase transition-all duration-300 rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_rgba(255,102,196,0.25)] cursor-pointer"
        >
          <FileText size={13} /> Export Analytics (CSV)
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Active Artists</span>
            <div className="p-1.5 bg-zinc-50 rounded-lg group-hover:bg-pink-50 transition-colors">
              <Users size={16} className="text-zinc-600 group-hover:text-studio-pink transition-colors" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-black">{activeArtistsCount}</div>
            <p className="text-xs text-zinc-500 font-medium mt-1">Total registered & active</p>
          </div>
        </div>
        
        <div className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Bookings (Month)</span>
            <div className="p-1.5 bg-zinc-50 rounded-lg group-hover:bg-pink-50 transition-colors">
              <Calendar size={16} className="text-zinc-600 group-hover:text-studio-pink transition-colors" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-black">{thisMonthBookings.length}</div>
            <p className="text-xs text-zinc-500 font-medium mt-1">Scheduled for this month</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Booked Hours</span>
            <div className="p-1.5 bg-zinc-50 rounded-lg group-hover:bg-pink-50 transition-colors">
              <Clock size={16} className="text-zinc-600 group-hover:text-studio-pink transition-colors" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-black">{totalBookedHours}</div>
            <p className="text-xs text-zinc-500 font-medium mt-1">Total hours this month</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Upcoming</span>
            <div className="p-1.5 bg-zinc-50 rounded-lg group-hover:bg-pink-50 transition-colors">
              <TrendingUp size={16} className="text-zinc-600 group-hover:text-studio-pink transition-colors" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-black">{upcomingBookings.length}</div>
            <p className="text-xs text-zinc-500 font-medium mt-1">Future appointments</p>
          </div>
        </div>
      </div>

      {/* Top Performers Ranking Cards */}
      <div>
        <h4 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-4 pl-1">Top Performers</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-zinc-200/80 rounded-2xl shadow-xs flex items-center gap-4 hover:border-studio-pink/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-pink-50 flex flex-shrink-0 items-center justify-center text-studio-pink">
              <Award size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase truncate">Most Bookings</p>
              <p className="text-sm font-black text-black truncate">{topBookings?.name || 'N/A'}</p>
              <p className="text-xs text-zinc-500">{topBookings?.bookingsThisMonth || 0} this month</p>
            </div>
          </div>
          
          <div className="p-4 bg-white border border-zinc-200/80 rounded-2xl shadow-xs flex items-center gap-4 hover:border-studio-pink/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-pink-50 flex flex-shrink-0 items-center justify-center text-studio-pink">
              <Clock size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase truncate">Most Hours</p>
              <p className="text-sm font-black text-black truncate">{topHours?.name || 'N/A'}</p>
              <p className="text-xs text-zinc-500">{topHours?.bookedHoursThisMonth || 0} hours</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-zinc-200/80 rounded-2xl shadow-xs flex items-center gap-4 hover:border-studio-pink/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-pink-50 flex flex-shrink-0 items-center justify-center text-studio-pink">
              <CalendarCheck size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase truncate">Most Upcoming</p>
              <p className="text-sm font-black text-black truncate">{topUpcoming?.name || 'N/A'}</p>
              <p className="text-xs text-zinc-500">{topUpcoming?.upcomingBookings || 0} future</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-zinc-200/80 rounded-2xl shadow-xs flex items-center gap-4 hover:border-studio-pink/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-pink-50 flex flex-shrink-0 items-center justify-center text-studio-pink">
              <Star size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase truncate">Highest Completion</p>
              <p className="text-sm font-black text-black truncate">{topCompletion?.name || 'N/A'}</p>
              <p className="text-xs text-zinc-500">{topCompletion ? Math.round((topCompletion.completedBookings / (topCompletion.totalBookings || 1))*100) : 0}% rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bookings Per Artist */}
        <div className="p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-xs lg:col-span-2">
          <h4 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase border-b border-zinc-100 pb-3 mb-4">Bookings Per Artist (This Month)</h4>
          <div className="space-y-4 pt-2">
            {sortedByBookings.slice(0,5).map(artist => (
              <div key={artist.name} className="flex items-center gap-3">
                <div className="w-24 text-xs font-bold text-zinc-700 truncate">{artist.name}</div>
                <div className="flex-1 h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-studio-pink to-pink-400 rounded-full transition-all duration-1000"
                    style={{ width: `${(artist.bookingsThisMonth / maxArtistBookings) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-right text-xs font-bold text-zinc-500">{artist.bookingsThisMonth}</div>
              </div>
            ))}
            {sortedByBookings.length === 0 && <div className="text-xs text-zinc-400 italic">No activity this month</div>}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-xs flex flex-col">
          <h4 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase border-b border-zinc-100 pb-3 mb-6">Booking Status</h4>
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                {/* Cancelled */}
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-zinc-200" strokeWidth="4" />
                {/* Upcoming */}
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-pink-300" strokeWidth="4" 
                        strokeDasharray={`${(upcomingBookings.length / totalStatus) * 100} 100`} 
                        strokeDashoffset={`-${((completedBookings.length + cancelledBookings.length) / totalStatus) * 100}`} />
                {/* Completed */}
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-studio-pink" strokeWidth="4" 
                        strokeDasharray={`${(completedBookings.length / totalStatus) * 100} 100`} 
                        strokeDashoffset={`-${(cancelledBookings.length / totalStatus) * 100}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-black">{totalStatus}</span>
                <span className="text-[8px] font-bold text-zinc-400 uppercase">Total</span>
              </div>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-2 text-xs font-medium text-zinc-600">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-studio-pink"></div> Completed ({completedBookings.length})</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-300"></div> Upcoming ({upcomingBookings.length})</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-zinc-200"></div> Cancelled ({cancelledBookings.length})</div>
            </div>
          </div>
        </div>

      </div>


      {/* Booking History Table */}
      <div className="p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex justify-between items-center mb-4 border-b border-zinc-100 pb-3">
          <h4 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Recent Bookings</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="py-3 px-2 text-[10px] font-black tracking-widest text-zinc-400 uppercase">Date</th>
                <th className="py-3 px-2 text-[10px] font-black tracking-widest text-zinc-400 uppercase">Artist</th>
                <th className="py-3 px-2 text-[10px] font-black tracking-widest text-zinc-400 uppercase">Client</th>
                <th className="py-3 px-2 text-[10px] font-black tracking-widest text-zinc-400 uppercase">Duration</th>
                <th className="py-3 px-2 text-[10px] font-black tracking-widest text-zinc-400 uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((booking, i) => (
                <tr key={booking.id || i} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3 px-2 text-xs font-medium text-zinc-600">
                    {new Date(booking.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                    <div className="text-[10px] text-zinc-400 mt-0.5">{booking.timeStr || `${booking.start}:00 - ${booking.end}:00`}</div>
                  </td>
                  <td className="py-3 px-2 text-xs font-bold text-zinc-800">{booking.artist}</td>
                  <td className="py-3 px-2 text-xs font-medium text-zinc-600">{booking.name || booking.client || 'Client'}</td>
                  <td className="py-3 px-2 text-xs font-medium text-zinc-600">{(Number(booking.end) || 0) - (Number(booking.start) || 0)}h</td>
                  <td className="py-3 px-2 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase ${
                      booking.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                      booking.status === 'Cancelled' ? 'bg-red-50 text-red-500' :
                      'bg-pink-50 text-studio-pink'
                    }`}>
                      {booking.status || 'Upcoming'}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-xs text-zinc-400 italic">No bookings history</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
