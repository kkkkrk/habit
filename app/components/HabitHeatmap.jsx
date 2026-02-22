'use client';

import { useRef, useEffect, useState } from 'react';
import { eachDayOfInterval, subDays, format, startOfWeek, getDay } from 'date-fns';

const getHeatColor = (count, accent) => {
    if (count === 0) return 'var(--border)';
    const a = Math.min(count / 5, 1);
    return a < 0.25 ? accent + '40' : a < 0.5 ? accent + '80' : a < 0.75 ? accent + 'BB' : accent;
};

export default function HabitHeatmap({ data, compact = false, accentColor }) {
    const color = accentColor || '#30d158';
    const scrollRef = useRef(null);
    const [tooltip, setTooltip] = useState(null); // { x, y, date, count }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, []);

    const today = new Date();
    const startDate = startOfWeek(subDays(today, 364), { weekStartsOn: 0 });
    const dates = eachDayOfInterval({ start: startDate, end: today });

    const countMap = {};
    (data || []).forEach(({ date, count }) => { countMap[date] = count; });

    const weeks = [];
    let cur = [];
    dates.forEach(date => {
        const d = getDay(date);
        if (d === 0 && cur.length > 0) { weeks.push(cur); cur = []; }
        cur.push(date);
    });
    if (cur.length > 0) weeks.push(cur);

    const monthLabels = weeks.map((week, i) => {
        const label = format(week[0], 'M월');
        if (i === 0) return label;
        return format(weeks[i - 1][0], 'M') !== format(week[0], 'M') ? label : '';
    });

    const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
    const cell = compact ? 9 : 13;
    const gap = compact ? 2 : 3;

    const handleMouseEnter = (e, ds, cnt) => {
        e.currentTarget.style.opacity = '0.75';
        if (cnt <= 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top - 8,
            date: ds,
            count: cnt,
        });
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.opacity = '1';
        setTooltip(null);
    };

    return (
        <>
            {/* 커스텀 툴팁 */}
            {tooltip && (
                <div style={{
                    position: 'fixed',
                    left: tooltip.x,
                    top: tooltip.y,
                    transform: 'translate(-50%, -100%)',
                    zIndex: 9999,
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{tooltip.date}</p>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: tooltip.count > 0 ? color : 'var(--text-tertiary)' }}>
                        {tooltip.count > 0 ? `${tooltip.count}회 완료` : '기록 없음'}
                    </p>
                </div>
            )}

            <div ref={scrollRef} style={{ display: 'inline-block', overflowX: 'auto', maxWidth: '100%' }}>
                {!compact && (
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
                        전체 활동 기록
                    </p>
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                    {!compact && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: gap + 'px', marginTop: '18px' }}>
                            {DAYS.map((d, i) => (
                                <div key={d} style={{ height: cell + 'px', fontSize: '10px', color: 'var(--text-tertiary)', lineHeight: cell + 'px', visibility: i % 2 === 1 ? 'visible' : 'hidden' }}>
                                    {d}
                                </div>
                            ))}
                        </div>
                    )}
                    <div>
                        {!compact && (
                            <div style={{ display: 'flex', gap: gap + 'px', marginBottom: '4px' }}>
                                {weeks.map((_, i) => (
                                    <div key={i} style={{ width: cell + 'px', fontSize: '10px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                                        {monthLabels[i]}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: gap + 'px' }}>
                            {weeks.map((week, wi) => (
                                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: gap + 'px' }}>
                                    {Array.from({ length: 7 }, (_, di) => {
                                        const date = week.find(d => getDay(d) === di);
                                        if (!date) return <div key={di} style={{ width: cell + 'px', height: cell + 'px' }} />;
                                        const ds = format(date, 'yyyy-MM-dd');
                                        const cnt = countMap[ds] ?? 0;
                                        return (
                                            <div
                                                key={ds}
                                                style={{
                                                    width: cell + 'px', height: cell + 'px',
                                                    borderRadius: '3px',
                                                    backgroundColor: getHeatColor(cnt, color),
                                                    transition: 'opacity 0.1s',
                                                    cursor: 'default',
                                                }}
                                                onMouseEnter={e => handleMouseEnter(e, ds, cnt)}
                                                onMouseLeave={handleMouseLeave}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}