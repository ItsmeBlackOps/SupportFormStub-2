import React, { useState, useEffect } from 'react';
import { format, parse, addDays, addHours, addMinutes, setHours, setMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { Popover } from '@headlessui/react';

interface DateTimePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
}

export function DateTimePicker({ id, value, onChange, required = false, label }: DateTimePickerProps) {
  const [date, setDate] = useState<Date>(() => value ? new Date(value) : new Date());
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value) {
      const dateObj = new Date(value);
      const hours = dateObj.getHours();
      setSelectedHour(hours % 12 || 12);
      setSelectedMinute(dateObj.getMinutes());
      setSelectedPeriod(hours >= 12 ? 'PM' : 'AM');
      setDate(dateObj);
    }
  }, [value]);

  const updateDateTime = (newDate: Date, hour: number, minute: number, period: 'AM' | 'PM') => {
    const hours24 = period === 'PM' ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
    const updatedDate = setMinutes(setHours(newDate, hours24), minute);
    onChange(updatedDate.toISOString());
  };

  const handleDateSelect = (newDate: Date) => {
    setDate(newDate);
    updateDateTime(newDate, selectedHour, selectedMinute, selectedPeriod);
  };

  const handleTimeChange = (hour: number, minute: number, period: 'AM' | 'PM') => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
    updateDateTime(date, hour, minute, period);
  };

  const generateTimeOptions = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    return { hours, minutes };
  };

  const { hours, minutes } = generateTimeOptions();
  const weeks = Array.from({ length: 6 }, (_, weekIndex) => {
    const week = Array.from({ length: 7 }, (_, dayIndex) => {
      const currentDate = addDays(date, (weekIndex * 7 + dayIndex) - 15);
      return currentDate;
    });
    return week;
  });

  const formattedValue = value 
    ? format(new Date(value), 'MMM d, yyyy h:mm aa')
    : '';

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label || 'Date & Time'}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <Popover className="relative">
        <Popover.Button className="w-full">
          <div className="flex items-center justify-between w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-left shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700">{formattedValue || 'Select date and time'}</span>
            </div>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
        </Popover.Button>

        <Popover.Panel className="absolute z-10 mt-1 w-screen max-w-[360px] px-4 sm:px-0">
          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="relative bg-white p-4">
              {/* Calendar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setDate(prev => addDays(prev, -30))}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <span className="text-gray-900 font-medium">
                    {format(date, 'MMMM yyyy')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDate(prev => addDays(prev, 30))}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-gray-500 text-sm py-1">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {weeks.flat().map((day, index) => {
                    const isSelected = format(date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                    const isToday = format(new Date(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(day)}
                        className={`
                          p-2 text-sm rounded-full hover:bg-gray-100
                          ${isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                          ${isToday && !isSelected ? 'border border-indigo-600' : ''}
                          ${format(day, 'MM') !== format(date, 'MM') ? 'text-gray-400' : 'text-gray-700'}
                        `}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Picker */}
              <div className="flex items-center space-x-4">
                <select
                  value={selectedHour}
                  onChange={(e) => handleTimeChange(parseInt(e.target.value), selectedMinute, selectedPeriod)}
                  className="block w-20 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  {hours.map(hour => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>

                <span className="text-gray-500">:</span>

                <select
                  value={selectedMinute}
                  onChange={(e) => handleTimeChange(selectedHour, parseInt(e.target.value), selectedPeriod)}
                  className="block w-20 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  {minutes.map(minute => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPeriod}
                  onChange={(e) => handleTimeChange(selectedHour, selectedMinute, e.target.value as 'AM' | 'PM')}
                  className="block w-20 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>
        </Popover.Panel>
      </Popover>
    </div>
  );
}