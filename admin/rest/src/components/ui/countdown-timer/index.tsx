import { useEffect, useMemo, useState } from 'react';
import { SeparatorIcon } from '@/components/icons/timer-separator';
import { twMerge } from 'tailwind-merge';
import classNames from 'classnames';

type CountdownTimerProps = {
  date: Date | undefined | '';
  title?: string;
  className?: string;
};

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
};

const CompletionMessage = () => (
  <span className="text-sm">You are good to go!</span>
);

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

  return {
    days: Math.floor(totalSeconds / (60 * 60 * 24)),
    hours: Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60)),
    minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
    seconds: totalSeconds % 60,
    completed: false,
  };
};

const CountdownView = (
  { days, hours, minutes, seconds, completed }: CountdownState,
  props: { className?: string },
) => {
  if (completed) {
    return <CompletionMessage />;
  }

  return (
    <div
      className={twMerge(
        classNames(
          'flex gap-2 text-lg text-accent [&>p]:rounded [&>p]:bg-accent [&>p]:p-3 [&>p]:text-sm [&>p]:font-semibold [&>p]:text-white [&>span]:self-center',
          props?.className,
        ),
      )}
    >
      <p>{days}d</p>
      <span>
        <SeparatorIcon />
      </span>
      <p>{hours}h</p>
      <span>
        <SeparatorIcon />
      </span>
      <p>{minutes}m</p>
      <span>
        <SeparatorIcon />
      </span>
      <p>{seconds}s</p>
    </div>
  );
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  date,
  title,
  className,
}) => {
  const targetDate = useMemo(() => {
    if (!date) {
      return undefined;
    }

    return date instanceof Date ? date : new Date(date);
  }, [date]);

  const [countdown, setCountdown] = useState<CountdownState>(() =>
    getCountdownState(targetDate),
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
