import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import './MySchedulePage.css';

const MySchedulePage = () => {
    const { t, language } = useTranslation();
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = {
        monday: t('schedule.monday'),
        tuesday: t('schedule.tuesday'),
        wednesday: t('schedule.wednesday'),
        thursday: t('schedule.thursday'),
        friday: t('schedule.friday'),
        saturday: t('schedule.saturday'),
        sunday: t('schedule.sunday')
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async() => {
        try {
            setLoading(true);
            const response = await api.get('/scheduling/my-schedule');
            setSchedule(response.data.data);
            setError('');
        } catch (err) {
            setError(language === 'en' ? 'Failed to load schedule.' : 'Program yüklenemedi.');
            console.error('Error fetching schedule:', err);
        } finally {
            setLoading(false);
        }
    };

    // İstatistikleri hesapla
    const calculateStats = () => {
        if (!schedule) return { totalClasses: 0, totalHours: 0, daysWithClasses: 0 };

        let totalClasses = 0;
        let totalMinutes = 0;
        let daysWithClasses = 0;

        days.forEach(day => {
            if (schedule[day] && schedule[day].length > 0) {
                daysWithClasses++;
                schedule[day].forEach(item => {
                    totalClasses++;
                    // Saatleri parse et ve dakikaya çevir
                    const [startHour, startMin] = item.start_time.split(':').map(Number);
                    const [endHour, endMin] = item.end_time.split(':').map(Number);
                    const startTotal = startHour * 60 + startMin;
                    const endTotal = endHour * 60 + endMin;
                    totalMinutes += (endTotal - startTotal);
                });
            }
        });

        const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
        return { totalClasses, totalHours, daysWithClasses };
    };

    const stats = calculateStats();

    const handleExportICal = async() => {
        try {
            const response = await api.get('/scheduling/my-schedule/ical', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'schedule.ics');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert(language === 'en' ? 'Failed to download iCal file.' : 'iCal dosyası indirilemedi.');
        }
    };

    if (loading) {
        return ( <
            div className = "app-container" >
            <
            Navbar / >
            <
            Sidebar / >
            <
            main >
            <
            div className = "my-schedule-page" >
            <
            div className = "loading-container" >
            <
            div className = "loading-spinner" > ⏳ < /div> <
            p className = "loading-text" > { language === 'en' ? 'Loading your schedule...' : 'Programınız yükleniyor...' } < /p> <
            /div> <
            /div> <
            /main> <
            /div>
        );
    }

    if (error) {
        return ( <
            div className = "app-container" >
            <
            Navbar / >
            <
            Sidebar / >
            <
            main >
            <
            div className = "error-message" > { error } < /div> <
            /main> <
            /div>
        );
    }

    return ( <
        div className = "app-container" >
        <
        Navbar / >
        <
        Sidebar / >
        <
        main >
        <
        div className = "my-schedule-page" >
        <
        div className = "schedule-header" >
        <
        div >
        <
        h1 > { t('schedule.mySchedule') } < /h1> <
        p className = "schedule-subtitle" > {
            language === 'en' ?
            'View and manage your weekly course schedule' :
                'Haftalık ders programınızı görüntüleyin ve yönetin'
        } <
        /p> <
        /div> <
        button onClick = { handleExportICal }
        className = "export-btn" > { language === 'en' ? '📥 Download as iCal' : '📥 iCal Olarak İndir' } <
        /button> <
        /div>

        { /* İstatistik Kartları */ } <
        div className = "stats-container" >
        <
        div className = "stat-card stat-card-primary" >
        <
        div className = "stat-icon" > 📚 < /div> <
        div className = "stat-content" >
        <
        div className = "stat-value" > { stats.totalClasses } < /div> <
        div className = "stat-label" > { language === 'en' ? 'Total Classes' : 'Toplam Ders' } <
        /div> <
        /div> <
        /div> <
        div className = "stat-card stat-card-success" >
        <
        div className = "stat-icon" > ⏰ < /div> <
        div className = "stat-content" >
        <
        div className = "stat-value" > { stats.totalHours }
        h < /div> <
        div className = "stat-label" > { language === 'en' ? 'Weekly Hours' : 'Haftalık Saat' } <
        /div> <
        /div> <
        /div> <
        div className = "stat-card stat-card-info" >
        <
        div className = "stat-icon" > 📅 < /div> <
        div className = "stat-content" >
        <
        div className = "stat-value" > { stats.daysWithClasses }
        /7</div >
        <
        div className = "stat-label" > { language === 'en' ? 'Active Days' : 'Aktif Gün' } <
        /div> <
        /div> <
        /div> <
        div className = "stat-card stat-card-warning" >
        <
        div className = "stat-icon" > 🎓 < /div> <
        div className = "stat-content" >
        <
        div className = "stat-value" > {
            schedule && Object.values(schedule).some(day => day && day.length > 0) ?
            (language === 'en' ? 'Active' : 'Aktif') :
                (language === 'en' ? 'Empty' : 'Boş')
        } <
        /div> <
        div className = "stat-label" > { language === 'en' ? 'Schedule Status' : 'Program Durumu' } <
        /div> <
        /div> <
        /div> <
        /div>

        { /* Bilgilendirme Kartı */ } <
        div className = "info-card" >
        <
        div className = "info-icon" > ℹ️ < /div> <
        div className = "info-content" >
        <
        h3 > { language === 'en' ? 'Schedule Information' : 'Program Bilgileri' } < /h3> <
        p > {
            language === 'en' ?
            'Your weekly schedule shows all your enrolled courses with their times, locations, and sections. You can export your schedule as an iCal file to add it to your calendar application.' :
                'Haftalık programınız, kayıtlı olduğunuz tüm dersleri zamanları, konumları ve şubeleriyle birlikte gösterir. Programınızı iCal dosyası olarak dışa aktararak takvim uygulamanıza ekleyebilirsiniz.'
        } <
        /p> <
        /div> <
        /div>

        { /* Ders Programı */ } {
            schedule && ( <
                div className = "schedule-container" >
                <
                div className = "schedule-grid" > {
                    days.map(day => ( <
                        div key = { day }
                        className = "schedule-day" >
                        <
                        h3 > { dayLabels[day] } < /h3> <
                        div className = "schedule-items" > {
                            schedule[day] && schedule[day].length > 0 ? (
                                schedule[day].map((item, index) => ( <
                                    div key = { index }
                                    className = "schedule-item" >
                                    <
                                    div className = "schedule-time" > { item.start_time } - { item.end_time } <
                                    /div> <
                                    div className = "schedule-course" >
                                    <
                                    strong > { item.course_code } < /strong> <
                                    div className = "course-name" > { item.course_name } < /div> <
                                    /div> <
                                    div className = "schedule-section" > { t('common.section') } { item.section_number } <
                                    /div> <
                                    div className = "schedule-classroom" > 📍{ item.classroom.building } { item.classroom.room_number } <
                                    /div> <
                                    /div>
                                ))
                            ) : ( <
                                div className = "no-class" >
                                <
                                div className = "no-class-icon" > ✨ < /div> <
                                div className = "no-class-text" > { language === 'en' ? 'No class' : 'Ders yok' } <
                                /div> <
                                /div>
                            )
                        } <
                        /div> <
                        /div>
                    ))
                } <
                /div> <
                /div>
            )
        }

        { /* Boş Program Durumu */ } {
            (!schedule || Object.values(schedule).every(day => !day || day.length === 0)) && ( <
                div className = "empty-schedule-container" >
                <
                div className = "empty-schedule-content" >
                <
                div className = "empty-schedule-icon" > 📋 < /div> <
                h2 > { language === 'en' ? 'No Schedule Available' : 'Program Bulunamadı' } < /h2> <
                p > {
                    language === 'en' ?
                    'You haven\'t enrolled in any courses yet. Visit the course enrollment page to add courses to your schedule.' :
                        'Henüz hiç derse kayıt olmadınız. Ders programınıza ders eklemek için ders kayıt sayfasını ziyaret edin.'
                } <
                /p> <
                div className = "empty-schedule-tips" >
                <
                h3 > { language === 'en' ? 'Quick Tips:' : 'Hızlı İpuçları:' } < /h3> <
                ul >
                <
                li > {
                    language === 'en' ?
                    'Check available courses in the enrollment section' :
                        'Kayıt bölümünden mevcut dersleri kontrol edin'
                } <
                /li> <
                li > {
                    language === 'en' ?
                    'Make sure you\'re enrolled in at least one course section' :
                        'En az bir ders şubesine kayıtlı olduğunuzdan emin olun'
                } <
                /li> <
                li > {
                    language === 'en' ?
                    'Contact your advisor if you need assistance' :
                        'Yardıma ihtiyacınız varsa danışmanınızla iletişime geçin'
                } <
                /li> <
                /ul> <
                /div> <
                /div> <
                /div>
            )
        } <
        /div> <
        /main> <
        /div>
    );
};

export default MySchedulePage;