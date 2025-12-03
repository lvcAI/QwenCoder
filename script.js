// 孩子成长记录表应用
class GrowthTracker {
    constructor() {
        this.records = JSON.parse(localStorage.getItem('growthRecords')) || [];
        this.chart = null;
        this.init();
    }

    init() {
        // 设置默认日期为今天
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('recordDate').value = today;
        
        // 绑定事件
        document.getElementById('addRecordBtn').addEventListener('click', () => this.addRecord());
        
        // 初始化图表
        this.renderChart();
        
        // 显示现有记录
        this.renderRecordsTable();
    }

    // 添加新记录
    addRecord() {
        const childName = document.getElementById('childName').value;
        const childGender = document.getElementById('childGender').value;
        const childBirthDate = document.getElementById('childBirthDate').value;
        const recordDate = document.getElementById('recordDate').value;
        const height = parseFloat(document.getElementById('height').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const headCircumference = parseFloat(document.getElementById('headCircumference').value);

        if (!childName || !childBirthDate || !recordDate || !height || !weight) {
            alert('请填写所有必填字段（姓名、出生日期、记录日期、身高、体重）');
            return;
        }

        // 计算年龄（以月为单位）
        const birthDate = new Date(childBirthDate);
        const recordDateTime = new Date(recordDate);
        const ageInMonths = this.calculateAgeInMonths(birthDate, recordDateTime);

        const newRecord = {
            id: Date.now(), // 使用时间戳作为唯一ID
            childName,
            childGender,
            childBirthDate,
            recordDate,
            height,
            weight,
            headCircumference,
            ageInMonths
        };

        this.records.push(newRecord);
        this.saveToLocalStorage();
        this.renderChart();
        this.renderRecordsTable();

        // 清空输入框
        document.getElementById('height').value = '';
        document.getElementById('weight').value = '';
        document.getElementById('headCircumference').value = '';
        document.getElementById('recordDate').value = new Date().toISOString().split('T')[0];

        alert('记录添加成功！');
    }

    // 计算年龄（月）
    calculateAgeInMonths(birthDate, recordDate) {
        const months = (recordDate.getFullYear() - birthDate.getFullYear()) * 12;
        const monthDiff = recordDate.getMonth() - birthDate.getMonth();
        return months + monthDiff + (recordDate.getDate() >= birthDate.getDate() ? 0 : -1);
    }

    // 从本地存储保存数据
    saveToLocalStorage() {
        localStorage.setItem('growthRecords', JSON.stringify(this.records));
    }

    // 渲染图表
    renderChart() {
        const ctx = document.getElementById('growthChart').getContext('2d');
        
        // 销毁现有图表实例
        if (this.chart) {
            this.chart.destroy();
        }

        // 准备图表数据
        const sortedRecords = [...this.records].sort((a, b) => new Date(a.recordDate) - new Date(b.recordDate));
        
        const labels = sortedRecords.map(record => {
            // 日期格式化为 MM/DD 或 YYYY/MM/DD
            const date = new Date(record.recordDate);
            return date.getMonth() + 1 + '/' + date.getDate();
        });
        
        const heights = sortedRecords.map(record => record.height);
        const weights = sortedRecords.map(record => record.weight);
        const headCircumferences = sortedRecords.map(record => record.headCircumference || null);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '身高 (cm)',
                        data: heights,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: '体重 (kg)',
                        data: weights,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: '头围 (cm)',
                        data: headCircumferences,
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '生长发育曲线图'
                    },
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // 渲染记录表格
    renderRecordsTable() {
        const tbody = document.getElementById('recordsTableBody');
        tbody.innerHTML = '';

        // 按日期排序记录
        const sortedRecords = [...this.records].sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));

        sortedRecords.forEach(record => {
            const row = document.createElement('tr');
            
            // 格式化日期
            const recordDate = new Date(record.recordDate);
            const formattedDate = recordDate.toLocaleDateString('zh-CN');
            
            // 计算年龄文本
            const ageText = this.formatAge(record.ageInMonths);
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${ageText}</td>
                <td class="height-cell">${record.height} cm</td>
                <td class="weight-cell">${record.weight} kg</td>
                <td class="head-circumference-cell">${record.headCircumference ? record.headCircumference + ' cm' : '-'}</td>
                <td>
                    <button class="delete-btn" onclick="growthTracker.deleteRecord(${record.id})">删除</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });

        // 如果没有记录，显示提示信息
        if (sortedRecords.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" style="text-align: center; color: #999;">暂无记录，请添加孩子的生长数据</td>
            `;
            tbody.appendChild(row);
        }
    }

    // 格式化年龄显示
    formatAge(ageInMonths) {
        if (ageInMonths < 12) {
            return `${ageInMonths} 个月`;
        } else {
            const years = Math.floor(ageInMonths / 12);
            const months = ageInMonths % 12;
            return months > 0 ? `${years} 岁 ${months} 个月` : `${years} 岁`;
        }
    }

    // 删除记录
    deleteRecord(id) {
        if (confirm('确定要删除这条记录吗？')) {
            this.records = this.records.filter(record => record.id !== id);
            this.saveToLocalStorage();
            this.renderChart();
            this.renderRecordsTable();
        }
    }
}

// 初始化应用
let growthTracker;
document.addEventListener('DOMContentLoaded', () => {
    growthTracker = new GrowthTracker();
});

// 添加一些示例数据以供演示（仅在没有数据时）
window.addEventListener('load', () => {
    if (!localStorage.getItem('growthRecords')) {
        // 示例数据
        const exampleData = [
            {
                id: 1,
                childName: '小明',
                childGender: 'male',
                childBirthDate: '2023-01-01',
                recordDate: '2023-06-01',
                height: 75.5,
                weight: 9.2,
                headCircumference: 46.0,
                ageInMonths: 5
            },
            {
                id: 2,
                childName: '小明',
                childGender: 'male',
                childBirthDate: '2023-01-01',
                recordDate: '2023-09-01',
                height: 78.2,
                weight: 10.5,
                headCircumference: 47.0,
                ageInMonths: 8
            },
            {
                id: 3,
                childName: '小明',
                childGender: 'male',
                childBirthDate: '2023-01-01',
                recordDate: '2023-12-01',
                height: 80.0,
                weight: 11.0,
                headCircumference: 47.5,
                ageInMonths: 11
            }
        ];
        
        localStorage.setItem('growthRecords', JSON.stringify(exampleData));
        
        // 重新初始化应用以加载示例数据
        if (growthTracker) {
            growthTracker.records = exampleData;
            growthTracker.renderChart();
            growthTracker.renderRecordsTable();
        }
    }
});