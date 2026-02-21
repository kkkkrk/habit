'use client';

import { eachDayOfInterval, subDays, format, startOfWeek, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 활동량에 따른 색상
const getColor = (count) => {
    if (count === 0) return '#ebedf0';
    // if (count <= 1) return '#9be9a8';
    // if (count <= 3) return '#40c463';
    // if (count <= 5) return '#30a14e';
    return '#216e39';
};

export default function HabitHeatmap({ data }) {
    const today = new Date();
    // 1년 전 그 주의 일요일부터 시작
    const startDate = startOfWeek(subDays(today, 364), { weekStartsOn: 0 });

    // 시작일 ~ 오늘 날짜 배열
    const dates = eachDayOfInterval({ start: startDate, end: today });

    // 날짜 → count 맵
    const countMap = {};
    (data || []).forEach(({ date, count }) => {
        countMap[date] = count;
    });

    // 주(week) 단위로 날짜를 분리
    const weeks = [];
    let currentWeek = [];
    dates.forEach((date) => {
        const dayOfWeek = getDay(date); // 0=일 ~ 6=토
        if (dayOfWeek === 0 && currentWeek.length > 0) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
        currentWeek.push(date);
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);

    // 월 라벨 계산 (각 주의 첫 날이 월이 바뀌는 시점)
    const monthLabels = weeks.map((week, i) => {
        const firstDay = week[0];
        const label = format(firstDay, 'M월');
        // 이전 주와 월이 다르면 라벨 표시
        if (i === 0) return label;
        const prevFirst = weeks[i - 1][0];
        return format(prevFirst, 'M') !== format(firstDay, 'M') ? label : '';
    });

    return (
        <div style={{
            background: 'rgb(255, 92, 51)',
            // color: 'black',
            border: '1px solid #e1e4e8',
            borderRadius: '12px',
            padding: '20px',
            display: 'inline-block',
            overflowX: 'auto',
            maxWidth: '100%',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: 'black' }}>
                내 활동 기록
            </h2>

            <div style={{ display: 'flex', gap: '4px' }}>
                {/* 요일 라벨 (왼쪽) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '20px' }}>
                    {DAYS.map((day, i) => (
                        <div key={day} style={{
                            height: '12px',
                            fontSize: '10px',
                            color: 'black',
                            lineHeight: '12px',
                            visibility: i % 2 === 1 ? 'visible' : 'hidden',  // 홀수 요일만 표시
                        }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* 그리드 본체 */}
                <div>
                    {/* 월 라벨 */}
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                        {weeks.map((_, i) => (
                            <div key={i} style={{ width: '12px', fontSize: '10px', color: 'black', whiteSpace: 'nowrap' }}>
                                {monthLabels[i]}
                            </div>
                        ))}
                    </div>

                    {/* 주 단위 열(column) 렌더링 */}
                    <div style={{ display: 'flex', gap: '2px' }}>
                        {weeks.map((week, wIdx) => (
                            <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {/* 일요일(0)부터 토요일(6)까지 7칸 보장 */}
                                {Array.from({ length: 7 }, (_, dayIdx) => {
                                    const date = week.find(d => getDay(d) === dayIdx);
                                    if (!date) {
                                        // 해당 요일 날짜 없으면 빈 칸
                                        return (
                                            <div key={dayIdx} style={{ width: '12px', height: '12px' }} />
                                        );
                                    }
                                    const dateStr = format(date, 'yyyy-MM-dd');
                                    const count = countMap[dateStr] ?? 0;
                                    return (
                                        <div
                                            key={dateStr}
                                            title={`${dateStr}: ${count}회 완료`}
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '2px',
                                                backgroundColor: getColor(count),
                                                cursor: 'pointer',
                                                transition: 'opacity 0.1s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}