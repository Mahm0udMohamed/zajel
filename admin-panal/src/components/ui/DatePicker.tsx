import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

const MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export function DatePicker({
  value = "",
  onChange,
  label,
  className = "",
  disabled = false,
  required = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getUTCMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getUTCFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // تحديث التاريخ المحدد عند تغيير القيمة
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        // استخدام UTC لجميع العمليات
        setCurrentMonth(date.getUTCMonth());
        setCurrentYear(date.getUTCFullYear());
        // تحويل التاريخ إلى تنسيق DD/MM/YYYY للعرض (استخدام UTC)
        const day = String(date.getUTCDate()).padStart(2, "0");
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const year = date.getUTCFullYear();
        setInputValue(`${day}/${month}/${year}`);
      }
    } else {
      setSelectedDate(null);
      setInputValue("");
    }
  }, [value]);

  // إغلاق التقويم عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(Date.UTC(year, month, 1)).getUTCDay();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getUTCDate() === today.getUTCDate() &&
      date.getUTCMonth() === today.getUTCMonth() &&
      date.getUTCFullYear() === today.getUTCFullYear() &&
      date.getUTCMonth() === currentMonth &&
      date.getUTCFullYear() === currentYear
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getUTCDate() === selectedDate.getUTCDate() &&
      date.getUTCMonth() === selectedDate.getUTCMonth() &&
      date.getUTCFullYear() === selectedDate.getUTCFullYear() &&
      date.getUTCMonth() === currentMonth &&
      date.getUTCFullYear() === currentYear
    );
  };

  const isHovered = (date: Date) => {
    if (!hoveredDate) return false;
    return (
      date.getUTCDate() === hoveredDate.getUTCDate() &&
      date.getUTCMonth() === hoveredDate.getUTCMonth() &&
      date.getUTCFullYear() === hoveredDate.getUTCFullYear()
    );
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(Date.UTC(currentYear, currentMonth, day, 0, 0, 0)); // تعيين الوقت إلى 00:00 (12 ص) UTC
    setSelectedDate(newDate);

    // إرسال التاريخ فقط بدون وقت (استخدام نفس القيم المختارة)
    const year = currentYear;
    const month = String(currentMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const dateString = `${year}-${month}-${dayStr}`;

    onChange?.(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    // استخدام UTC لجميع العمليات
    setCurrentMonth(today.getUTCMonth());
    setCurrentYear(today.getUTCFullYear());
    // إنشاء تاريخ اليوم مع الوقت 00:00 UTC
    const todayAtMidnight = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        0,
        0,
        0
      )
    );
    setSelectedDate(todayAtMidnight);

    // إرسال التاريخ فقط بدون وقت (استخدام UTC)
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, "0");
    const day = String(today.getUTCDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    onChange?.(dateString);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // إزالة جميع الأحرف غير الرقمية
    value = value.replace(/\D/g, "");

    // تنسيق التاريخ تلقائياً
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2);
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + "/" + value.substring(5, 9);
    }

    // تحديد الحد الأقصى للطول
    if (value.length > 10) {
      value = value.substring(0, 10);
    }

    setInputValue(value);
    setIsTyping(true);

    // تحويل التاريخ إلى تنسيق datetime-local إذا كان صحيحاً
    if (value.length === 10) {
      const parts = value.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        // التحقق من صحة التاريخ
        if (
          day >= 1 &&
          day <= 31 &&
          month >= 1 &&
          month <= 12 &&
          year >= 1900 &&
          year <= 2100
        ) {
          const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // تعيين الوقت إلى 00:00 (12 ص) UTC
          if (
            !isNaN(date.getTime()) &&
            date.getUTCDate() === day &&
            date.getUTCMonth() === month - 1
          ) {
            // إرسال التاريخ فقط بدون وقت
            const yearStr = String(date.getUTCFullYear());
            const monthStr = String(date.getUTCMonth() + 1).padStart(2, "0");
            const dayStr = String(date.getUTCDate()).padStart(2, "0");
            const dateString = `${yearStr}-${monthStr}-${dayStr}`;
            onChange?.(dateString);
            // تحديث inputValue بالتنسيق المكتوب (DD/MM/YYYY)
            setInputValue(formatTypedDate(date));
            // لا نحدث التقويم عند الكتابة المباشرة - الكتابة مستقلة عن التقويم
            // لا نضع setIsTyping(false) هنا حتى يبقى التاريخ المكتوب
          }
        }
      }
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    // إذا كان المستخدم ينقر على أيقونة التقويم، افتح التقويم
    if (e.target !== inputRef.current) {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
    // لا نفتح التقويم عند الضغط على Enter أو Space أثناء الكتابة
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // إضافة الأيام الفارغة في بداية الشهر
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // إضافة أيام الشهر
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(currentYear, currentMonth, day));
      const isSelectedDay = isSelected(date);
      const isTodayDay = isToday(date);
      const isHoveredDay = isHovered(date);

      days.push(
        <button
          key={day}
          type="button"
          className={`
            h-8 w-8 rounded-md text-sm font-medium transition-all duration-200
            flex items-center justify-center
            ${
              isSelectedDay
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                : isTodayDay
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : isHoveredDay
                ? "bg-purple-500/30 text-white"
                : "text-gray-300 hover:bg-purple-500/20 hover:text-white"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          onClick={() => !disabled && handleDateSelect(day)}
          onMouseEnter={() => !disabled && setHoveredDate(date)}
          onMouseLeave={() => setHoveredDate(null)}
          disabled={disabled}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const formatDisplayValue = () => {
    // إذا كان هناك قيمة مكتوبة، نعرضها كما هي
    if (inputValue && inputValue.length === 10) {
      return inputValue;
    }

    if (isTyping) {
      return inputValue;
    }

    if (!selectedDate) return "";

    // إذا كان التاريخ من التقويم، نعرضه بالتنسيق العربي فقط إذا لم يكن هناك inputValue
    if (selectedDate && !isTyping && !inputValue) {
      const day = selectedDate.getUTCDate();
      const month = MONTHS[selectedDate.getUTCMonth()];
      const year = selectedDate.getUTCFullYear();
      return `${day} ${month} ${year}`;
    }

    return "";
  };

  // دالة لتنسيق التاريخ المكتوب (استخدام UTC)
  const formatTypedDate = (date: Date) => {
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <Label className="text-white font-medium mb-2 block">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={formatDisplayValue()}
          placeholder="DD/MM/YYYY"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsTyping(true)}
          onBlur={() => {
            // عند الانتهاء من الكتابة، نحتفظ بالقيمة المكتوبة
            if (inputValue && inputValue.length === 10) {
              // إذا كان التاريخ صحيحاً، نحتفظ به ولا نغير isTyping
              // هذا يضمن أن التاريخ المكتوب يبقى كما هو
            } else if (inputValue && inputValue.length !== 10) {
              // إذا كان التاريخ غير مكتمل، نمسحه
              setInputValue("");
              setIsTyping(false);
            } else {
              setIsTyping(false);
            }
          }}
          disabled={disabled}
          data-typing={isTyping}
          className={`
            date-picker-input
            bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20
            cursor-text pr-10
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleInputClick}
          disabled={disabled}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-purple-500/20"
        >
          <Calendar className="h-4 w-4 text-purple-400 hover:text-purple-300" />
        </Button>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full mt-2 z-50 bg-black border border-gray-800 rounded-lg shadow-2xl p-4 w-full sm:min-w-[280px] sm:max-w-none"
          style={{
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0 hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <div className="text-white font-medium text-sm">
                {MONTHS[currentMonth]} {currentYear}
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0 hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {/* لا نعرض أيام الأسبوع كما طلب المستخدم */}
          </div>

          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTodayClick}
              className="bg-purple-600 border-purple-600 text-white hover:bg-purple-700 hover:border-purple-700 text-xs px-3 py-1 shadow-purple-500/20"
            >
              اليوم
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="bg-purple-600 border-purple-600 text-white hover:bg-purple-700 hover:border-purple-700 shadow-purple-500/20"
            >
              إغلاق
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
