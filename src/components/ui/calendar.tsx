import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
                    className,
                    classNames,
                    showOutsideDays = true,
                    captionLayout = "label",
                    buttonVariant = "ghost",
                    formatters,
                    components,
                    ...props
                  }: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
      <DayPicker
          showOutsideDays={showOutsideDays}
          className={cn(
              "bg-background p-3",
              "[--cell-size:4rem] sm:[--cell-size:2.8rem]",
              "rtl:**:[.rdp-button_next>svg]:rotate-180",
              "rtl:**:[.rdp-button_previous>svg]:rotate-180",
              className
          )}
          captionLayout={captionLayout}
          formatters={{
            formatMonthDropdown: (date) =>
                date.toLocaleString("default", { month: "short" }),
            ...formatters,
          }}
          classNames={{
            root: cn("w-fit h-fill", defaultClassNames.root),
            months: cn("relative flex flex-col gap-4", defaultClassNames.months),
            month: cn("flex flex-col gap-2", defaultClassNames.month),
            nav: cn(
                "absolute inset-x-0 top-0 flex items-center justify-between",
                defaultClassNames.nav
            ),
            button_previous: cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                defaultClassNames.button_previous
            ),
            button_next: cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                defaultClassNames.button_next
            ),
            month_caption: cn(
                "flex h-7 items-center justify-center text-sm font-medium",
                defaultClassNames.month_caption
            ),
            table: "w-full border-collapse border-spacing-0",
            weekdays: "flex w-full justify-between",
            weekday: "text-muted-foreground w-[1.7em] flex-none select-none text-[0.8rem] font-normal text-center",
            week: "flex w-full mt-2 justify-between",
            day: "p-0 relative w-[1rem] text-center focus-within:relative focus-within:z-20",
            today: "bg-accent text-accent-foreground rounded-md",
            outside: "text-muted-foreground opacity-50",
            disabled: "text-muted-foreground opacity-50",
            hidden: "invisible",
            range_start: "day-range-start",
            range_end: "day-range-end",
            selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            ...classNames,
          }}
          components={{
            Root: ({ className, rootRef, ...props }) => (
                <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
            ),
            Chevron: ({ orientation, className, ...props }) => {
              if (orientation === "left") return <ChevronLeftIcon className={cn("h-4 w-4", className)} {...props} />
              if (orientation === "right") return <ChevronRightIcon className={cn("h-4 w-4", className)} {...props} />
              return <ChevronDownIcon className={cn("h-4 w-4", className)} {...props} />
            },
            DayButton: CalendarDayButton,
            ...components,
          }}
          {...props}
      />
  )
}

function CalendarDayButton({
                             className,
                             day,
                             modifiers,
                             ...props
                           }: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
      <Button
          ref={ref}
          variant="ghost"
          data-day={day.date.toLocaleDateString()}
          data-selected={modifiers.selected}
          className={cn(
              "h-[--cell-size] w-[--cell-size] p-0 font-normal",
              "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
              "flex items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
              className
          )}
          {...props}
      />
  )
}

export { Calendar, CalendarDayButton }