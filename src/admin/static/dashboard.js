// Load dashboard data
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Dashboard loading...');
    
    loadDashboard();
    setTimeout(() => loadFilterOptions(), 500);
    setTimeout(() => loadSchedule(), 500);
    setTimeout(() => loadUsers(), 500);
    setTimeout(() => loadFeedback(), 500);
    setTimeout(() => loadAnalytics(), 500);
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('uploadForm').addEventListener('submit', uploadFile);
    document.getElementById('backupBtn').addEventListener('click', createBackup);
    document.getElementById('clearBtn').addEventListener('click', confirmClear);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });
    
    // Add filter change listeners
    document.getElementById('programSearch').addEventListener('input', () => loadSchedule());
    document.getElementById('courseFilter').addEventListener('change', () => loadSchedule());
    document.getElementById('instituteFilter').addEventListener('change', () => {
        updateDirectionFilter();
        loadSchedule();
    });
    document.getElementById('directionFilter').addEventListener('change', () => loadSchedule());
    document.getElementById('dayFilter').addEventListener('change', () => loadSchedule());
    document.getElementById('sortBy').addEventListener('change', () => loadSchedule());
    document.getElementById('filterBtn').addEventListener('click', () => loadSchedule());
});

function switchTab(e) {
    const tabName = e.target.getAttribute('data-tab');
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // Remove active class from all contents
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked button and corresponding content
    e.target.classList.add('active');
    const tabContent = document.getElementById(`${tabName}-tab`);
    if (tabContent) {
        tabContent.classList.add('active');
    }
}

async function loadDashboard() {
    try {
        console.log('📥 Fetching /api/dashboard...');
        const response = await fetch('/api/dashboard', {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            console.log('❌ Not authenticated, redirecting to login');
            window.location.href = '/';
            return;
        }
        
        const data = await response.json();
        console.log('✅ Dashboard data:', data);
        
        if (data) {
            document.getElementById('scheduleCount').textContent = data.schedule_records || 0;
            document.getElementById('institutesCount').textContent = data.institutes || 0;
            document.getElementById('groupsCount').textContent = data.programs || 0;
            document.getElementById('usersCount').textContent = data.users || 0;
            document.getElementById('dauCount').textContent = data.dau || 0;
            document.getElementById('mauCount').textContent = data.mau || 0;
            
            console.log('✅ Dashboard metrics updated');
            displayLogs(data.recent_logs || []);
        }
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
    }
}

function displayLogs(logs) {
    const logsList = document.getElementById('logsList');
    
    if (!logs || logs.length === 0) {
        logsList.innerHTML = '<p style="color: var(--text-secondary); padding: 20px;">Нет логов операций</p>';
        return;
    }
    
    logsList.innerHTML = logs.map(log => `
        <div class="log-item">
            <div>
                <strong>${log.filename}</strong><br>
                <small class="log-date">${new Date(log.created_at).toLocaleString('ru-RU')}</small>
            </div>
            <span class="log-status ${log.status}">${log.status === 'success' ? '✓ Успешно' : '✗ Ошибка'}</span>
        </div>
    `).join('');
}

async function uploadFile(e) {
    e.preventDefault();
    
    const file = document.getElementById('excelFile').files[0];
    const mode = document.getElementById('uploadMode').value;
    const statusDiv = document.getElementById('uploadStatus');
    const progressDiv = document.getElementById('uploadProgress');
    
    if (!file) {
        statusDiv.innerHTML = '<p style="color: red;">Пожалуйста, выберите файл</p>';
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);
    
    progressDiv.style.display = 'block';
    statusDiv.innerHTML = '<p>Загрузка...</p>';
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        const data = await response.json();
        progressDiv.style.display = 'none';
        
        if (response.ok) {
            statusDiv.innerHTML = `
                <div style="background: rgba(76, 175, 80, 0.1); border: 1px solid green; padding: 15px; border-radius: 5px; color: green;">
                    <strong>✅ Успешно!</strong><br>
                    Загружено ${data.records_added} записей<br>
                    ${data.records_failed > 0 ? `Ошибок: ${data.records_failed}` : 'Без ошибок'}
                </div>
            `;
            
            document.getElementById('excelFile').value = '';
            setTimeout(() => loadDashboard(), 1000);
        } else {
            statusDiv.innerHTML = `<div style="background: rgba(244, 67, 54, 0.1); border: 1px solid red; padding: 15px; border-radius: 5px; color: red;"><strong>❌ Ошибка:</strong> ${data.error}</div>`;
        }
    } catch (error) {
        progressDiv.style.display = 'none';
        statusDiv.innerHTML = `<div style="color: red;"><strong>❌ Ошибка:</strong> ${error.message}</div>`;
        console.error('Upload error:', error);
    }
}

async function createBackup() {
    try {
        const response = await fetch('/api/create-backup', {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`✅ Резервная копия создана: ${data.filename}`);
        } else {
            alert(`❌ Ошибка: ${data.error}`);
        }
    } catch (error) {
        alert(`❌ Ошибка: ${error.message}`);
    }
}

function confirmClear() {
    if (confirm('⚠️ Вы уверены? Это действие необратимо и удалит все данные расписания!')) {
        clearDatabase();
    }
}

async function clearDatabase() {
    try {
        const response = await fetch('/api/clear-database', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('✅ База данных очищена');
            loadDashboard();
        } else {
            alert('❌ Ошибка при очистке базы данных');
        }
    } catch (error) {
        alert(`❌ Ошибка: ${error.message}`);
    }
}

async function loadFilterOptions() {
    try {
        console.log('📥 Fetching filter options...');
        const response = await fetch('/api/schedule/filters', {
            credentials: 'include'
        });
        
        const data = await response.json();
        console.log('✅ Filter options:', data);
        
        if (data.success) {
            // Fill day filter
            const dayFilter = document.getElementById('dayFilter');
            data.days.forEach(day => {
                const option = document.createElement('option');
                option.value = day;
                option.textContent = day;
                dayFilter.appendChild(option);
            });
            
            // Fill course filter
            const courseFilter = document.getElementById('courseFilter');
            data.courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course;
                option.textContent = `Курс ${course}`;
                courseFilter.appendChild(option);
            });
            
            // Fill institute filter
            const instituteFilter = document.getElementById('instituteFilter');
            data.institutes.forEach(institute => {
                const option = document.createElement('option');
                option.value = institute;
                option.textContent = institute;
                instituteFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('❌ Error loading filters:', error);
    }
}

async function updateDirectionFilter() {
    const institute = document.getElementById('instituteFilter').value;
    
    try {
        const url = institute 
            ? `/api/schedule/directions?institute=${encodeURIComponent(institute)}` 
            : '/api/schedule/directions';
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            const directionFilter = document.getElementById('directionFilter');
            // Clear existing options except first
            while (directionFilter.options.length > 1) {
                directionFilter.remove(1);
            }
            
            // Add new options
            data.directions.forEach(direction => {
                const option = document.createElement('option');
                option.value = direction;
                option.textContent = direction;
                directionFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error updating direction filter:', error);
    }
}

async function loadSchedule(page = 1) {
    try {
        console.log('📥 Fetching schedule...');
        
        const programSearch = document.getElementById('programSearch').value;
        const course = document.getElementById('courseFilter').value;
        const institute = document.getElementById('instituteFilter').value;
        const direction = document.getElementById('directionFilter').value;
        const day = document.getElementById('dayFilter').value;
        const sort = document.getElementById('sortBy').value;
        
        const params = new URLSearchParams({
            page,
            limit: 50,
            group_search: programSearch,
            course,
            institute,
            direction,
            day,
            sort
        });
        
        const response = await fetch(`/api/schedule?${params}`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        console.log('✅ Schedule data:', data);
        
        if (data.success) {
            displayScheduleTable(data.data || []);
            displayPagination('schedulePagination', data.page, data.pages,
                            (p) => loadSchedule(p));
        }
    } catch (error) {
        console.error('❌ Error loading schedule:', error);
        document.querySelector('#scheduleTable tbody').innerHTML = 
            '<tr><td colspan="16" style="color: red; padding: 20px;">Ошибка при загрузке расписания</td></tr>';
    }
}

function displayScheduleTable(schedules) {
    const tbody = document.querySelector('#scheduleTable tbody');
    
    if (!schedules || schedules.length === 0) {
        tbody.innerHTML = '<tr><td colspan="16" style="text-align: center; color: var(--text-secondary); padding: 20px;">Нет данных расписания</td></tr>';
        return;
    }
    
    tbody.innerHTML = schedules.map(schedule => `
        <tr>
            <td>${schedule['Программа'] || '—'}</td>
            <td>${schedule['Курс'] || '—'}</td>
            <td>${schedule['Форма обучения'] || '—'}</td>
            <td>${schedule['Уровень образования'] || '—'}</td>
            <td>${schedule['Институт'] || '—'}</td>
            <td>${schedule['Направление'] || '—'}</td>
            <td>${schedule['Номер группы'] || '—'}</td>
            <td>${schedule['День недели'] || '—'}</td>
            <td>${schedule['Номер пары'] || '—'}</td>
            <td>${schedule['Время пары'] || '—'}</td>
            <td>${schedule['Чётность'] || '—'}</td>
            <td>${schedule['Предмет'] || '—'}</td>
            <td>${schedule['Вид пары'] || '—'}</td>
            <td>${schedule['Преподаватель'] || '—'}</td>
            <td>${schedule['Номер аудитории'] || '—'}</td>
            <td>${schedule['Недели'] || '—'}</td>
        </tr>
    `).join('');
}

async function loadUsers(page = 1) {
    try {
        console.log('📥 Fetching users...');
        const response = await fetch(`/api/users?limit=50&page=${page}`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        console.log('✅ Users data:', data);
        
        if (data.success) {
            displayUsersTable(data.data || []);
            displayPagination('usersPagination', data.page, data.pages,
                            (p) => loadUsers(p));
        }
    } catch (error) {
        console.error('❌ Error loading users:', error);
        document.querySelector('#usersTable tbody').innerHTML = 
            '<tr><td colspan="13" style="color: red; padding: 20px;">Ошибка при загрузке пользователей</td></tr>';
    }
}

function displayUsersTable(users) {
    const tbody = document.querySelector('#usersTable tbody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" style="text-align: center; color: var(--text-secondary); padding: 20px;">Нет зарегистрированных пользователей</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const createdDate = new Date(user.created_at).toLocaleString('ru-RU');
        const updatedDate = user.updated_at ? new Date(user.updated_at).toLocaleString('ru-RU') : '—';
        const lastActivity = user.last_activity ? new Date(user.last_activity).toLocaleString('ru-RU') : '—';
        
        return `
            <tr>
                <td><code>${user.user_id}</code></td>
                <td>${user.username || '—'}</td>
                <td>${user.form || '—'}</td>
                <td>${user.education || '—'}</td>
                <td>${user.course || '—'}</td>
                <td>${user.institute || '—'}</td>
                <td>${user.direction || '—'}</td>
                <td>${user.program || '—'}</td>
                <td><strong>${user.group || '—'}</strong></td>
                <td><small>${createdDate}</small></td>
                <td><small>${updatedDate}</small></td>
                <td>${user.total_actions || 0}</td>
                <td><small>${lastActivity}</small></td>
            </tr>
        `;
    }).join('');
}

async function loadFeedback(page = 1) {
    try {
        console.log('📥 Fetching feedback...');
        const response = await fetch(`/api/feedback?page=${page}&limit=50`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        console.log('✅ Feedback data:', data);
        
        if (data.success) {
            displayFeedbackTable(data.data || []);
            displayPagination('feedbackPagination', data.page, data.pages,
                            (p) => loadFeedback(p));
        }
    } catch (error) {
        console.error('❌ Error loading feedback:', error);
        document.querySelector('#feedbackTable tbody').innerHTML = 
            '<tr><td colspan="6" style="color: red; padding: 20px;">Ошибка при загрузке отзывов</td></tr>';
    }
}

function displayFeedbackTable(feedbacks) {
    const tbody = document.querySelector('#feedbackTable tbody');
    
    if (!feedbacks || feedbacks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 20px;">Нет отзывов</td></tr>';
        return;
    }
    
    tbody.innerHTML = feedbacks.map(feedback => {
        const date = new Date(feedback.created_at).toLocaleString('ru-RU');
        return `
            <tr>
                <td>${feedback.id || '—'}</td>
                <td><code>${feedback.user_id}</code></td>
                <td>${feedback.username || '—'}</td>
                <td>${feedback.user_group || '—'}</td>
                <td>${feedback.message}</td>
                <td><small>${date}</small></td>
            </tr>
        `;
    }).join('');
}

async function loadAnalytics() {
    try {
        console.log('📥 Fetching analytics...');
        const response = await fetch('/api/analytics', {
            credentials: 'include'
        });
        
        const data = await response.json();
        console.log('✅ Analytics data:', data);
        
        if (data) {
            // Update basic metrics
            document.getElementById('totalActiveUsers').textContent = data.active_users || 0;
            document.getElementById('totalFeedback').textContent = data.total_feedback || 0;
            
            // Create retention metrics section
            let metricsSection = document.querySelector('.analytics-metrics');
            if (!metricsSection.innerHTML || metricsSection.innerHTML.trim() === '') {
                metricsSection.style.display = 'block';
                metricsSection.innerHTML = `
                    <div class="metrics-row">
                        <div class="stat-card">
                            <h4>Заявки на сервисы</h4>
                            <p class="stat-value">${data.total_applications || 0}</p>
                            <small>Всего отправлено заявок</small>
                        </div>
                        <div class="stat-card">
                            <h4>Retention D1</h4>
                            <p class="stat-value">${data.retention_d1 || 0}</p>
                            <small>Вернулись на следующий день</small>
                        </div>
                        <div class="stat-card">
                            <h4>Retention D7</h4>
                            <p class="stat-value">${data.retention_d7 || 0}</p>
                            <small>Вернулись на 7-й день</small>
                        </div>
                        <div class="stat-card">
                            <h4>Среднее сессий</h4>
                            <p class="stat-value">${data.avg_sessions_per_user || 0}</p>
                            <small>На пользователя</small>
                        </div>
                        <div class="stat-card">
                            <h4>Всего сессий</h4>
                            <p class="stat-value">${data.total_sessions || 0}</p>
                            <small>За все время</small>
                        </div>
                    </div>
                `;
                console.log('✅ Created metrics section');
            }
            
            // Display applications by service
            const appsBody = document.querySelector('[data-table="applications"]');
            if (appsBody) {
                if (data.applications_by_service && data.applications_by_service.length > 0) {
                    appsBody.innerHTML = data.applications_by_service.map(app => `
                        <tr>
                            <td>${app.service_name}</td>
                            <td><strong>${app.count}</strong></td>
                        </tr>
                    `).join('');
                    console.log('✅ Applications table updated');
                } else {
                    appsBody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: var(--text-secondary);">Нет заявок</td></tr>';
                }
            }
            
            // Display top actions
            const topActionsBody = document.getElementById('topActionsBody');
            if (topActionsBody) {
                if (data.top_actions && data.top_actions.length > 0) {
                    topActionsBody.innerHTML = data.top_actions.map(action => `
                        <tr>
                            <td>${action.action}</td>
                            <td><strong>${action.count}</strong></td>
                        </tr>
                    `).join('');
                    console.log('✅ Top actions table updated');
                } else {
                    topActionsBody.innerHTML = '<tr><td colspan="2" style="text-align: center;">Нет данных</td></tr>';
                }
            }
            
            // Display service clicks
            const serviceClicksBody = document.getElementById('serviceClicksBody');
            if (serviceClicksBody) {
                if (data.service_clicks && data.service_clicks.length > 0) {
                    serviceClicksBody.innerHTML = data.service_clicks.map(click => `
                        <tr>
                            <td>${click.action}</td>
                            <td><strong>${click.count}</strong></td>
                        </tr>
                    `).join('');
                    console.log('✅ Service clicks table updated');
                } else {
                    serviceClicksBody.innerHTML = '<tr><td colspan="2" style="text-align: center;">Нет данных</td></tr>';
                }
            }
            
            // Display users per course
            const usersByCourseBody = document.getElementById('usersByCourseBody');
            if (usersByCourseBody) {
                if (data.users_per_course && data.users_per_course.length > 0) {
                    usersByCourseBody.innerHTML = data.users_per_course.map(course => `
                        <tr>
                            <td>Курс ${course['Курс']}</td>
                            <td><strong>${course.count}</strong></td>
                        </tr>
                    `).join('');
                    console.log('✅ Users by course table updated');
                } else {
                    usersByCourseBody.innerHTML = '<tr><td colspan="2" style="text-align: center;">Нет данных</td></tr>';
                }
            }
            
            // Display users per institute
            const usersPerInstituteBody = document.getElementById('usersPerInstituteBody');
            if (usersPerInstituteBody) {
                if (data.users_per_institute && data.users_per_institute.length > 0) {
                    usersPerInstituteBody.innerHTML = data.users_per_institute.map(inst => `
                        <tr>
                            <td>${inst['Институт']}</td>
                            <td><strong>${inst.count}</strong></td>
                        </tr>
                    `).join('');
                    console.log('✅ Users per institute table updated');
                } else {
                    usersPerInstituteBody.innerHTML = '<tr><td colspan="2" style="text-align: center;">Нет данных</td></tr>';
                }
            }
            
            console.log('✅ Analytics loaded successfully');
        }
    } catch (error) {
        console.error('❌ Error loading analytics:', error);
    }
}

function displayPagination(elementId, currentPage, totalPages, callback) {
    const container = document.getElementById(elementId);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    const buttons = [];
    
    // Previous button
    if (currentPage > 1) {
        buttons.push(`<button onclick="arguments[0].preventDefault(); (${callback.toString()})(${currentPage - 1})" 
                     style="padding: 8px 12px; margin: 0 4px; cursor: pointer; background: var(--primary); color: white; border: none; border-radius: 4px;">← Назад</button>`);
    }
    
    // Page numbers
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        if (i === currentPage) {
            buttons.push(`<button disabled style="padding: 8px 12px; margin: 0 4px; background: var(--primary); color: white; border: none; border-radius: 4px; font-weight: bold;">${i}</button>`);
        } else {
            buttons.push(`<button onclick="arguments[0].preventDefault(); (${callback.toString()})(${i})" 
                         style="padding: 8px 12px; margin: 0 4px; cursor: pointer; background: rgba(88, 101, 242, 0.1); color: var(--primary); border: 1px solid var(--primary); border-radius: 4px;">${i}</button>`);
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        buttons.push(`<button onclick="arguments[0].preventDefault(); (${callback.toString()})(${currentPage + 1})" 
                     style="padding: 8px 12px; margin: 0 4px; cursor: pointer; background: var(--primary); color: white; border: none; border-radius: 4px;">Вперед →</button>`);
    }
    
    container.innerHTML = `<div style="display: flex; justify-content: center; gap: 8px; padding: 20px;">${buttons.join('')}</div>`;
}

async function logout() {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/';
    }
}
