import { Search, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TransactionFilter({ 
  filters, 
  onFilterChange, 
  onReset 
}) {
  return (
    <div className="bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm p-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search by Transaction ID */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Mã giao dịch
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/30 focus:border-primary dark:focus:border-primary outline-none transition-all"
              placeholder="Tìm mã GD..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Trạng thái
          </label>
          <Select 
            value={filters.status} 
            onValueChange={(value) => onFilterChange('status', value)}
          >
            <SelectTrigger className="w-full h-[38px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            {/* 🔧 FIX: Thêm className để override background tối */}
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-[300px]">
              <SelectItem value="ALL" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="font-medium text-sm">Tất cả</span>
              </SelectItem>
              <SelectItem value="ACTIVE" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Thành công</span>
                </div>
              </SelectItem>
              <SelectItem value="PENDING" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Đang xử lý</span>
                </div>
              </SelectItem>
              <SelectItem value="CANCELLED" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Đã hủy</span>
                </div>
              </SelectItem>
              <SelectItem value="EXPIRED" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  <span>Hết hạn</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Package Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Loại gói
          </label>
          <Select 
            value={filters.package} 
            onValueChange={(value) => onFilterChange('package', value)}
          >
            <SelectTrigger className="w-full h-[38px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-[300px]">
              <SelectItem value="ALL" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="font-medium text-sm">Tất cả</span>
              </SelectItem>
              <SelectItem value="3_THANG" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">Gói 3 tháng</span>
              </SelectItem>
              <SelectItem value="6_THANG" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">Gói 6 tháng</span>
              </SelectItem>
              <SelectItem value="12_THANG" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">Gói 12 tháng</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Range Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Thời gian
          </label>
          <Select 
            value={filters.timeRange} 
            onValueChange={(value) => onFilterChange('timeRange', value)}
          >
            <SelectTrigger className="w-full h-[38px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-[300px]">
              <SelectItem value="ALL" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="font-medium text-sm">Tất cả</span>
              </SelectItem>
              <SelectItem value="7_DAYS" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">7 ngày qua</span>
              </SelectItem>
              <SelectItem value="30_DAYS" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">30 ngày qua</span>
              </SelectItem>
              <SelectItem value="90_DAYS" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">3 tháng qua</span>
              </SelectItem>
              <SelectItem value="1_YEAR" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-sm">1 năm qua</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters & Reset Button */}
      {(filters.search || filters.status !== 'ALL' || filters.package !== 'ALL' || filters.timeRange !== 'ALL') && (
        <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-2">
          {/* Active filters chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Đang lọc:</span>
            
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md border border-blue-200/50 dark:border-blue-800/50">
                Mã: {filters.search}
                <button 
                  onClick={() => onFilterChange('search', '')} 
                  className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.status !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-md border border-green-200/50 dark:border-green-800/50">
                {filters.status === 'ACTIVE' && 'Thành công'}
                {filters.status === 'PENDING' && 'Đang xử lý'}
                {filters.status === 'CANCELLED' && 'Đã hủy'}
                {filters.status === 'EXPIRED' && 'Hết hạn'}
                <button 
                  onClick={() => onFilterChange('status', 'ALL')} 
                  className="hover:text-green-900 dark:hover:text-green-100 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.package !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-md border border-purple-200/50 dark:border-purple-800/50">
                {filters.package.replace('_', ' ')}
                <button 
                  onClick={() => onFilterChange('package', 'ALL')} 
                  className="hover:text-purple-900 dark:hover:text-purple-100 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.timeRange !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs rounded-md border border-orange-200/50 dark:border-orange-800/50">
                {filters.timeRange === '7_DAYS' && '7 ngày'}
                {filters.timeRange === '30_DAYS' && '30 ngày'}
                {filters.timeRange === '90_DAYS' && '90 ngày'}
                {filters.timeRange === '1_YEAR' && '1 năm'}
                <button 
                  onClick={() => onFilterChange('timeRange', 'ALL')} 
                  className="hover:text-orange-900 dark:hover:text-orange-100 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          {/* Reset button */}
          <Button
            onClick={onReset}
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 hover:bg-slate-100 dark:hover:bg-slate-700/50"
          >
            <X className="h-3.5 w-3.5" />
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  );
}