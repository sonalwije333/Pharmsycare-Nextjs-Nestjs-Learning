import { useEffect, useMemo, useState } from 'react';
import { SeparatorIcon } from '@/components/icons/timer-separator';
import { twMerge } from 'tailwind-merge';
import classNames from 'classnames';

type CountdownTimerProps = {
  date: Date;
  title?: string;
  className?: string;
};

// Random component
const CompletionMessage = () => <span>You are good to go!</span>;

// Renderer callback with condition
const renderer = (
  {
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  },
    type CountdownState = {
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
      completed: boolean;
    };

    const getCountdownState = (targetDate: Date | undefined): CountdownState => {
      if (!targetDate) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          completed: true,
        };
      }

      const distance = targetDate.getTime() - Date.now();

      if (distance <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          completed: true,
        };
      }

      const totalSeconds = Math.floor(distance / 1000);
      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = totalSeconds % 60;

      return {
        <span>
          <SeparatorIcon />
        </span>
        <p>{hours}h</p>
        completed: false,
      };
    };

    const CountdownView = (
      { days, hours, minutes, seconds, completed }: CountdownState,
      props: { className?: string }
  }
};
const CountdownTimer: React.FC<CountdownTimerProps> = ({
  date,
  className,
}) => {
  const targetDate = useMemo(() => {
    if (!date) {
      return undefined;
    }

    return date instanceof Date ? date : new Date(date);
  }, [date]);

  const [countdown, setCountdown] = useState<CountdownState>(() =>
    getCountdownState(targetDate)
  );

  useEffect(() => {
    setCountdown(getCountdownState(targetDate));

    if (!targetDate) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown(getCountdownState(targetDate));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [targetDate]);

  return (
    <>
      {title ? (
        <h4 className="text-xl font-semibold text-muted-black">{title}</h4>
      ) : (
        ''
      )}
      {CountdownView(countdown, { className })}
    </>
  );
};

export default CountdownTimer;
