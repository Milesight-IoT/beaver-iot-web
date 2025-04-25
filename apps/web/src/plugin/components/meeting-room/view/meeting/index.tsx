import React, { useState, useEffect } from 'react';
import { Modal, toast } from '@milesight/shared/src/components';
import { TextField, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { meetingAPI, entityAPI } from '@/services/http';
import './style.less';
import { AxiosResponse } from 'axios';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

interface Entity {
    description: string;
    label: string;
    rawData: string;
    value: number;
    valueType: string;
}

interface RawData {
    deviceName: string;
    entityAccessMod: string;
    entityId: string;
    entityKey: string;
}

interface MeetingRoomScheduleProps {
    meetingData: RawData;
}

interface Meeting {
    meeting: string;
    subject: string;
    firstStartTime: number;
    lastEndTime: number;
    createTime: number;
    meetingId?: string;
}

interface ApiResponse<T> {
    data: T[];
    status: string;
    message: string;
}

const MeetingRoomSchedule: React.FC<MeetingRoomScheduleProps> = ({ meetingData }) => {
    const [meetingOffset, setMeetingOffset] = useState(0); // 86400
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedMeetingId, setSelectedMeetingId] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedStartTime, setSelectedStartTime] = useState('');
    const [selectedEndTime, setSelectedEndTime] = useState('');
    const [meetingId, setMeetingId] = useState(meetingData.deviceName + "预约");
    const [meetingTitle, setMeetingTitle] = useState(meetingData.deviceName + "预约");
    const [meetingRoomKey, setMeetingRoomKey] = useState(meetingData.entityKey);
    const [dragging, setDragging] = useState(false);
    const [allHistoryData, setAllHistoryData] = useState<Meeting[]>([]);
    const [filteredHistoryData, setFilteredHistoryData] = useState<Meeting[]>([]);
    const [currentWeek, setCurrentWeek] = useState(0);
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setMeetingTitle(meetingData.deviceName + "预约");
        setEditingMeeting(null);
    };

    const handleScheduleMeeting = async () => {
        const sortedTimes = [selectedStartTime, selectedEndTime].sort();
        const startTime = sortedTimes[0];
        const endTime = sortedTimes[1];

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;
        if (endTotalMinutes - startTotalMinutes < 60) {
            toast.warning('请选择至少1小时的时间段');
            return;
        }
        if (endTotalMinutes - startTotalMinutes > 180) {
            toast.warning('请选择最多3小时的时间段');
            return;
        }
        const first = Math.floor(new Date(selectedDate?.toISOString().split('T')[0] + " " + selectedStartTime).getTime() / 1000);
        const last = Math.floor(new Date(selectedDate?.toISOString().split('T')[0] + " " + selectedEndTime).getTime() / 1000);
        const meetingDataToSend = {
            type: !editingMeeting?0:1,
            subject: meetingTitle,
            meeting: meetingId,
            id: meetingData.entityId,
            key: meetingRoomKey,
            time: selectedStartTime,
            date: selectedDate?.toISOString().split('T')[0],
            first:  !editingMeeting?first:first+ meetingOffset,
            last: !editingMeeting?last:last+ meetingOffset,
        };
        try {
            await meetingAPI.addMeeting(meetingDataToSend);
            // 显示成功通知
            toast.success('Meeting scheduled successfully');
        } catch (error) {
            console.error('Error scheduling meeting:', error);
            toast.error('Failed to schedule meeting');
        }
        closeModal();
        fetchHistoryData(currentWeek); // Refresh the history data
    };

    const handleDeleteMeeting = async () => {
        console.error('Error deleting meeting:', selectedStartTime);
        const meetingDataToSend = {
            type: 2,
            subject: meetingTitle,
            meeting: meetingId,
            id: meetingData.entityId,
            key: meetingRoomKey,
            time: selectedStartTime,
            date: selectedDate?.toISOString().split('T')[0],
            first: Math.floor(new Date(selectedDate?.toISOString().split('T')[0] + " " + selectedStartTime).getTime() / 1000 + meetingOffset),
            last: Math.floor(new Date(selectedDate?.toISOString().split('T')[0] + " " + selectedEndTime).getTime() / 1000 + meetingOffset),
        };
        try {
            await meetingAPI.addMeeting(meetingDataToSend);
            // 显示成功通知
            toast.success('Delete Meeting scheduled successfully');
        } catch (error) {
            console.error('Error scheduling meeting:', error);
            toast.error('Failed to schedule meeting');
        }
        closeModal();
        fetchHistoryData(currentWeek); // Refresh the history data
    };

    const isPastTimeSlot = (day: string, time: string, weekOffset: number) => {
        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        const currentDayIndex = now.getDay() - 1;
        const slotDayIndex = daysOfWeek.indexOf(day);
        slotDate.setDate(now.getDate() + (slotDayIndex - currentDayIndex) + (weekOffset * 7));
        return slotDate < now;
    };

    const handleMouseDown = (day: string, time: string) => {
        if (!isPastTimeSlot(day, time, currentWeek)) {
            const meeting = getMeetingByTime(day, time);
            if (meeting) {
                // Edit existing meeting
                setEditingMeeting(meeting);
                setMeetingTitle(meeting.subject);
                console.log("=======meeting.meeting======", meeting)
                setMeetingId(meeting.meeting);
                setSelectedStartTime(new Date(meeting.firstStartTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                setSelectedEndTime(new Date(meeting.lastEndTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                setSelectedDate(new Date(meeting.firstStartTime * 1000));
                openModal();
            } else {
                // Schedule new meeting
                setDragging(true);
                // setSelectedMeetingId();
                setSelectedDay(day);
                setSelectedStartTime(time);
                setSelectedEndTime(time);
                const weekDates = getWeekDates(currentWeek);
                setSelectedDate(weekDates[daysOfWeek.indexOf(day)]);
            }
        }
    };

    const handleMouseUp = (day: string, time: string) => {
        if (dragging) {
            setDragging(false);
            const sortedTimes = [selectedStartTime, time].sort();
            const startTime = sortedTimes[0];
            const endTime = sortedTimes[1];

            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;

            if (endTotalMinutes - startTotalMinutes < 60) {
                toast.warning('请选择至少1小时的时间段');
                return;
            }
            if (endTotalMinutes - startTotalMinutes > 180) {
                toast.warning('请选择最多3小时的时间段');
                return;
            }

            setSelectedStartTime(startTime);
            setSelectedEndTime(endTime);
            openModal();
        }
    };

    const handleMouseEnter = (day: string, time: string) => {
        if (dragging && day === selectedDay) {
            setSelectedEndTime(time);
        }
    };

    const getWeekStartAndEnd = (weekOffset: number) => {
        const now = new Date();
        const currentDayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDayOfWeek + 1 + (weekOffset * 7));
        startOfWeek.setHours(0, 0, 0, 0); // 设置为当天的开始时间
    
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999); // 设置为当天的结束时间
    
        return {
            startOfWeek: startOfWeek.getTime(),
            endOfWeek: endOfWeek.getTime(),
        };
    };

    const handleDateChange = (data: any) => {
        console.log("-----------==--=", data)
        const tomorrow = new Date(data);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow)
    };


// 转换 response 数据
const transformApiResponse = (response) => {
    return response.data.data.content.map(item => {
        const value = item.value.match(/subject=([^,]+),.*meetingId=([^,]+),.*firstStartTime=([^,]+),.*lastEndTime=([^,]+)/);
        if (value) {
            const subject = value[1].trim();
            const meetingId = value[2].trim();
            const startTime = value[3].trim();
            const endTime = value[4].trim();
            // const startDateTime = new Date(`${startDate}T${startTime}`).getTime();
            // const endDateTime = startDateTime + (3 * 60 * 60 * 1000); // 假设会议持续3小时

            return {
                meetingId,
                meeting: meetingId,
                subject,
                firstStartTime: startTime,
                lastEndTime: endTime,
                id: item.timestamp.toString(),
            };
        }
        return null;
    }).filter(item => item !== null);
};
    const fetchHistoryData = async (weekOffset: number)  => {
        const { startOfWeek, endOfWeek } = getWeekStartAndEnd(weekOffset);
        try {
            
            const response = await entityAPI.getHistory({
                entity_id: meetingData.entityId,
                start_timestamp: startOfWeek,
                end_timestamp: endOfWeek,
                page_number: 1,
                page_size: 999,
            });
            const unifiedApiData = transformApiResponse(response);
            // 模拟从后端获取的数据
            const mockResponse: AxiosResponse<ApiResponse<Meeting>> = {
                data: {
                    data: unifiedApiData,
                    status: 'success',
                    message: 'Fetched successfully',
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {},
            };
            const result = mockResponse.data;
            setAllHistoryData(result.data);
            filterMeetingsForCurrentWeek(result.data);
        } catch (error) {
            console.error('Error fetching history data:', error);
        }
    };

    const filterMeetingsForCurrentWeek = (meetings: Meeting[]) => {
        const weekDates = getWeekDates(currentWeek);
        const startOfWeek = weekDates[0].getTime() / 1000;
        const endOfWeek = weekDates[6].getTime() / 1000 + 24 * 60 * 60 - 1; // End of the last day of the week

        // 过滤出当前周的会议
        const filteredMeetings = meetings.filter(meeting => {
            return meeting.firstStartTime >= startOfWeek && meeting.lastEndTime <= endOfWeek;
        });

        console.log('filteredMeetings=================', filteredMeetings);
        // 按 firstStartTime 分组，并在每个分组内根据 createTime 进行排序，取出最大的值
        const meetingMap = new Map<number, Meeting>();

        
        filteredMeetings.forEach(meeting => {
            const existingMeeting = meetingMap.get(meeting.firstStartTime);
            if (!existingMeeting || meeting.createTime > existingMeeting.createTime) {
                meetingMap.set(meeting.firstStartTime, meeting);
            }
        });

        // 将 Map 转换为数组
        const uniqueMeetings = Array.from(meetingMap.values());
        console.log('uniqueMeetings=================', uniqueMeetings);
        // 过滤出当前周的会议
        const uniqueMeetingss = uniqueMeetings.filter(meeting => {
            return meeting.subject !="" &&meeting.subject !="null";
        });

        setFilteredHistoryData(uniqueMeetingss);
    };

    useEffect(() => {
        fetchHistoryData(currentWeek);
        const intervalId = setInterval(fetchHistoryData, 60000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        filterMeetingsForCurrentWeek(allHistoryData);
    }, [currentWeek, allHistoryData]);

    const getWeekDates = (weekOffset: number) => {
        const now = new Date();
        const currentDayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDayOfWeek + 1 + (weekOffset * 7));
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const weekDates = getWeekDates(currentWeek);

    const handleWeekChange = (weekOffset: number) => {
        fetchHistoryData(weekOffset); // Fetch history data for the new week
        setCurrentWeek(weekOffset);
    };

    const getTimeSlotClass = (day: string, time: string) => {
        const pastTimeSlot = isPastTimeSlot(day, time, currentWeek);
        const isSelected = dragging && day === selectedDay && (
            (time >= selectedStartTime && time <= selectedEndTime) || 
            (time >= selectedEndTime && time <= selectedStartTime)
        );

        let className = `time-slot ${pastTimeSlot ? 'past-time-slot' : ''} ${isSelected ? 'selected-time-slot' : ''}`;
        return className;
    };

    const getMeetingByTime = (day: string, time: string): Meeting | null => {
        for (const meeting of filteredHistoryData) {
            const meetingDay = new Date(meeting.firstStartTime * 1000).toLocaleDateString();
            const meetingStartTime = new Date(meeting.firstStartTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const meetingEndTime = new Date(meeting.lastEndTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (meetingDay === weekDates[daysOfWeek.indexOf(day)].toLocaleDateString() &&
                time >= meetingStartTime && time < meetingEndTime) {
                return meeting;
            }
        }
        return null;
    };

    const renderHistoryMeetings = () => {
        console.log("=============", filteredHistoryData)
        return filteredHistoryData.map((meeting, index) => {
            const startDate = new Date(meeting.firstStartTime * 1000);
            const endDate = new Date(meeting.lastEndTime * 1000);
            const dayIndex = startDate.getDay() - 1;
            const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const top = parseInt(startTime.split(':')[0], 10) * 26 + parseInt(startTime.split(':')[1], 10) * 0.5 + 46;
            const height = ((parseInt(endTime.split(':')[0], 10) * 26 + parseInt(endTime.split(':')[1], 10) * 0.5) - 
                            (parseInt(startTime.split(':')[0], 10) * 26 + parseInt(startTime.split(':')[1], 10) * 0.5)) + 23;

            const isPast = endDate < new Date();

            return (
                <div
                    key={index}
                    className={`history-meeting ${isPast ? 'past-meeting' : ''}`}
                    style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: `${dayIndex<0? 85.68 : dayIndex==0?0.1:dayIndex* 14.28}%`,
                        width: '14.18%'
                    }}
                    onClick={() => handleMouseDown(daysOfWeek[(dayIndex<0?6:dayIndex)], startTime)}
                >
                    <div className="meeting-info">
                        <div className="meeting-subject">{meeting.subject}</div>
                        <div className="meeting-time">{startTime} - {endTime}</div>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="meeting-room-schedule">
            <div className="week-top">
                <div className="week-controls-top">
                    <h3 className="data-view-icon">{meetingData.deviceName}日程</h3>
                </div>
                <div className="week-controls">
                    <button className="rounded-button1" onClick={() => handleWeekChange(currentWeek - 1)}>上周</button>
                    <button className="rounded-button2" onClick={() => handleWeekChange(0)}>本周</button>
                    <button className="rounded-button3" onClick={() => handleWeekChange(currentWeek + 1)}>下周</button>
                </div>
            </div>
            <div className="schedule-grid">
                {daysOfWeek.map((day, index) => (
                    <div key={day} className="day-column">
                        <div className="day-header">{day} - {weekDates[index].toLocaleDateString()}</div>
                        {timeSlots.map(time => (
                            <div
                                key={time}
                                className={getTimeSlotClass(day, time)}
                                onMouseDown={() => handleMouseDown(day, time)}
                                onMouseUp={() => handleMouseUp(day, time)}
                                onMouseEnter={() => handleMouseEnter(day, time)}
                            >
                                <label className="meeting-room-label">{time}</label>
                            </div>
                        ))}
                    </div>
                ))}
                {renderHistoryMeetings()}
            </div>

            <Modal
                visible={modalIsOpen}
                onCancel={closeModal}
                onOk={handleScheduleMeeting}
                title={editingMeeting ? "编辑会议日程" : "预约会议日程"}
                onOkText="确定"
                onCancelText="取消"
                footer={[
                    <Button className="meeting-button-cancel" key="cancel" onClick={closeModal}>取消</Button>,
                    editingMeeting && <Button className="meeting-button-delete" key="delete" onClick={handleDeleteMeeting} color="secondary">撤销</Button>,
                    <Button className="meeting-button-primary" key="submit" type="primary" onClick={handleScheduleMeeting}>确认</Button>,
                ]}
            >
                <div className="modal-content">
                    <TextField
                        label="会议标题"
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    {/* <FormControl fullWidth margin="normal">
                        <InputLabel id="start-time-label">会议日期</InputLabel>
                        <DatePicker
                            format={selectedDate?.toISOString().split('T')[0]}
                            onChange={(e) => handleDateChange(e)}
                            />
                    </FormControl> */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="start-time-label">开始时间</InputLabel>
                        <Select
                            labelId="start-time-label"
                            value={selectedStartTime}
                            onChange={(e) => setSelectedStartTime(e.target.value as string)}
                        >
                            {timeSlots.map((time) => (
                                <MenuItem key={time} value={time}>{time}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="end-time-label">结束时间</InputLabel>
                        <Select
                            labelId="end-time-label"
                            value={selectedEndTime}
                            onChange={(e) => setSelectedEndTime(e.target.value as string)}
                        >
                            {timeSlots.map((time) => (
                                <MenuItem key={time} value={time}>{time}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            </Modal>

            <Modal
                visible={deleteConfirmVisible}
                onCancel={() => setDeleteConfirmVisible(false)}
                onOk={handleDeleteMeeting}
                title="确认删除"
                onOkText="删除"
                onCancelText="取消"
            >
                <div className="modal-content">
                    <p>您确定要删除这个会议吗？</p>
                </div>
            </Modal>
        </div>
    );
};

export default MeetingRoomSchedule;
