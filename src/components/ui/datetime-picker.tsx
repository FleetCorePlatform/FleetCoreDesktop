"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface DateTimePicker24hProps {
    scheduledDate: string;
    setScheduledDate: (val: string) => void;
    scheduledTime: string;
    setScheduledTime: (val: string) => void;
}

export function DateTimePicker24h({
      scheduledDate,
      setScheduledDate,
      scheduledTime,
      setScheduledTime
  }: DateTimePicker24hProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const internalDate = scheduledDate
        ? new Date(`${scheduledDate}T${scheduledTime || "00:00"}:00`)
        : undefined;

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            setScheduledDate(format(selectedDate, "yyyy-MM-dd"));
            if (!scheduledTime) {
                setScheduledTime("00:00");
            }
        } else {
            setScheduledDate("");
            setScheduledTime("");
        }
    };

    const handleTimeChange = (type: "hour" | "minute", value: string) => {
        const baseDate = internalDate || new Date();
        let currentHours = baseDate.getHours();
        let currentMinutes = baseDate.getMinutes();

        if (type === "hour") {
            currentHours = parseInt(value, 10);
        } else if (type === "minute") {
            currentMinutes = parseInt(value, 10);
        }

        setScheduledTime(
            `${currentHours.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}`
        );

        if (!scheduledDate) {
            setScheduledDate(format(new Date(), "yyyy-MM-dd"));
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !internalDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {internalDate ? (
                        format(internalDate, "MM/dd/yyyy HH:mm")
                    ) : (
                        <span>MM/DD/YYYY HH:mm</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0 overflow-hidden rounded-lg z-[1600]"
                align="start"
                side="bottom"
                sideOffset={4}
                collisionPadding={10}
            >
                <div className="flex flex-row sm:flex-row h-auto sm:h-[15em] bg-[hsl(var(--bg-tertiary))]!">
                    <div className="flex-1 p-0 overflow-auto">
                        <Calendar
                            mode="single"
                            className="bg-[hsl(var(--bg-tertiary))]!"
                            selected={internalDate}
                            onSelect={handleDateSelect}
                            disabled={{
                                before: new Date(),
                                after: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                            }}
                            initialFocus
                        />
                    </div>
                    <div className="flex flex-row h-[200px] sm:h-full divide-x bg-[hsl(var(--bg-tertiary))]/45 border-t sm:border-t-0 sm:border-l">
                        {/* Hour Column */}
                        <div className="flex flex-col flex-1 h-full">
                            <div className="px-3 py-2 text-center text-[10px] font-semibold uppercase text-muted-foreground border-b bg-[hsl(var(--bg-tertiary))]/45">
                                Hr
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="flex flex-col p-1.5">
                                    {hours.slice().reverse().map((hour) => (
                                        <Button
                                            key={hour}
                                            size="sm"
                                            variant={internalDate && internalDate.getHours() === hour ? "default" : "ghost"}
                                            className="w-full shrink-0 aspect-square text-xs"
                                            onClick={() => handleTimeChange("hour", hour.toString())}
                                        >
                                            {hour.toString().padStart(2, '0')}
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                        {/* Minute Column */}
                        <div className="flex flex-col flex-1 h-full">
                            <div className="px-3 py-2 text-center text-[10px] font-semibold uppercase text-muted-foreground border-b bg-[hsl(var(--bg-tertiary))]/45">
                                Min
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="flex flex-col p-1.5">
                                    {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                                        <Button
                                            key={minute}
                                            size="sm"
                                            variant={internalDate && internalDate.getMinutes() === minute ? "default" : "ghost"}
                                            className="w-full shrink-0 aspect-square text-xs"
                                            onClick={() => handleTimeChange("minute", minute.toString())}
                                        >
                                            {minute.toString().padStart(2, '0')}
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}