import React, { useState, useRef, useEffect } from 'react';
import { Send, Database, TrendingUp, AlertCircle, Sparkles, BarChart3, Download, Copy, Check, PieChart, LineChart, History, Clock, FileDown } from 'lucide-react';
import { BarChart, Bar, LineChart as RechartsLine, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample database schema - replace with your actual schema
const SAMPLE_SCHEMA = {
  sales: {
    columns: ['sale_id', 'product_id', 'customer_id', 'sale_date', 'quantity', 'revenue', 'region'],
    sample_data: 'sale_id: integer, product_id: text, customer_id: text, sale_date: date, quantity: integer, revenue: decimal, region: text'
  },
  products: {
    columns: ['product_id', 'product_name', 'category', 'price', 'cost'],
    sample_data: 'product_id: text, product_name: text, category: text, price: decimal, cost: decimal'
  },
  customers: {
    columns: ['customer_id', 'customer_name', 'segment', 'join_date', 'lifetime_value'],
    sample_data: 'customer_id: text, customer_name: text, segment: text, join_date: date, lifetime_value: decimal'
  }
};

const EXAMPLE_QUESTIONS = [
  "What were total sales by region last quarter?",
  "Show me the top 10 products by revenue",
  "Which customer segment has the highest average order value?",
  "Compare year-over-year revenue growth",
];

// Chart color palette
const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

// Demo mode responses - works without API key
const DEMO_RESPONSES = {
  "what were total sales by region last quarter?": {
    sql: `SELECT 
  region,
  SUM(revenue) as total_revenue,
  COUNT(DISTINCT sale_id) as total_orders,
  ROUND(AVG(revenue), 2) as avg_order_value
FROM sales
WHERE sale_date >= DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
  AND sale_date < DATE_TRUNC('quarter', CURRENT_DATE)
GROUP BY region
ORDER BY total_revenue DESC;`,
    results: [
      { region: 'West', total_revenue: 1560000, total_orders: 3420, avg_order_value: 456.14 },
      { region: 'North', total_revenue: 1450000, total_orders: 3285, avg_order_value: 441.39 },
      { region: 'South', total_revenue: 1320000, total_orders: 2987, avg_order_value: 441.98 },
      { region: 'East', total_revenue: 1180000, total_orders: 2756, avg_order_value: 428.16 }
    ],
    chartType: 'bar',
    chartConfig: {
      xKey: 'region',
      yKey: 'total_revenue',
      title: 'Revenue by Region'
    },
    highlights: [
      { icon: '📈', label: 'Top Performer', value: 'West region leads with $1.56M', type: 'success' },
      { icon: '⚠️', label: 'Needs Attention', value: 'East region -24% below top', type: 'warning' },
      { icon: '✨', label: 'Key Opportunity', value: 'Focus resources on East for 20% growth', type: 'info' }
    ],
    explanation: `## Summary
Last quarter showed strong performance across all regions, with total sales of $5.51M. The West region led with $1.56M in revenue, representing 28.3% of total sales.

## Key Insights
- **West region dominance**: Generated the highest revenue ($1.56M) and order volume (3,420 orders)
- **Consistent average order values**: All regions maintained similar AOV around $440, indicating consistent pricing strategy
- **Geographic opportunity**: East region has lowest performance - potential for targeted growth initiatives

## Recommendation
Focus on scaling successful West region strategies to East region markets. Consider regional marketing campaigns to boost East region order volume by 20-25% next quarter.`
  },
  "show me the top 10 products by revenue": {
    sql: `SELECT 
  p.product_id,
  p.product_name,
  p.category,
  SUM(s.revenue) as total_revenue,
  SUM(s.quantity) as units_sold,
  ROUND(SUM(s.revenue) / SUM(s.quantity), 2) as avg_price
FROM sales s
JOIN products p ON s.product_id = p.product_id
GROUP BY p.product_id, p.product_name, p.category
ORDER BY total_revenue DESC
LIMIT 10;`,
    results: [
      { product_name: 'Premium Laptop Pro', category: 'Electronics', total_revenue: 456000, units_sold: 380 },
      { product_name: 'Wireless Headphones X', category: 'Electronics', total_revenue: 389000, units_sold: 1945 },
      { product_name: 'Smart Watch Ultra', category: 'Wearables', total_revenue: 342000, units_sold: 855 },
      { product_name: 'Office Chair Deluxe', category: 'Furniture', total_revenue: 298000, units_sold: 745 },
      { product_name: 'Gaming Console Pro', category: 'Electronics', total_revenue: 267000, units_sold: 534 },
      { product_name: '4K Monitor 32"', category: 'Electronics', total_revenue: 234000, units_sold: 390 },
      { product_name: 'Desk Lamp LED', category: 'Home', total_revenue: 187000, units_sold: 2337 },
      { product_name: 'Mechanical Keyboard', category: 'Accessories', total_revenue: 156000, units_sold: 1040 },
      { product_name: 'Webcam HD Pro', category: 'Electronics', total_revenue: 134000, units_sold: 670 },
      { product_name: 'Mouse Wireless Pro', category: 'Accessories', total_revenue: 112000, units_sold: 1867 }
    ],
    chartType: 'bar',
    chartConfig: {
      xKey: 'product_name',
      yKey: 'total_revenue',
      title: 'Top 10 Products by Revenue'
    },
    highlights: [
      { icon: '🏆', label: 'Best Seller', value: 'Premium Laptop Pro generates $456K', type: 'success' },
      { icon: '📦', label: 'Volume Leader', value: 'Headphones X: 1,945 units sold', type: 'info' },
      { icon: '💡', label: 'Strategy', value: 'Bundle top 3 electronics for increased AOV', type: 'info' }
    ],
    explanation: `## Summary
Electronics dominate the top revenue generators, with the Premium Laptop Pro leading at $456K. The top 10 products collectively generated $2.58M in revenue.

## Key Insights
- **Electronics category strength**: 6 of top 10 products are electronics, representing 65% of top-tier revenue
- **High-value items perform well**: Premium Laptop Pro ($1,200 avg) shows strong demand for quality products
- **Volume sellers important**: Desk Lamp LED sold 2,337 units despite lower price point, demonstrating importance of accessible products

## Recommendations
1. Expand premium electronics line - high revenue per unit with strong sell-through
2. Bundle complementary products (laptop + mouse + keyboard) to increase basket size
3. Stock up on Wireless Headphones X ahead of holiday season - highest volume seller`
  },
  "which customer segment has the highest average order value?": {
    sql: `SELECT 
  c.segment,
  COUNT(DISTINCT s.sale_id) as total_orders,
  COUNT(DISTINCT s.customer_id) as unique_customers,
  SUM(s.revenue) as total_revenue,
  ROUND(AVG(s.revenue), 2) as avg_order_value,
  ROUND(SUM(s.revenue) / COUNT(DISTINCT s.customer_id), 2) as revenue_per_customer
FROM sales s
JOIN customers c ON s.customer_id = c.customer_id
GROUP BY c.segment
ORDER BY avg_order_value DESC;`,
    results: [
      { segment: 'Enterprise', total_orders: 1245, unique_customers: 89, total_revenue: 2340000, avg_order_value: 1879.52, revenue_per_customer: 26292.13 },
      { segment: 'Premium', total_orders: 2890, unique_customers: 456, total_revenue: 2156000, avg_order_value: 746.02, revenue_per_customer: 4728.07 },
      { segment: 'Standard', total_orders: 5670, unique_customers: 1834, total_revenue: 1890000, avg_order_value: 333.33, revenue_per_customer: 1030.54 },
      { segment: 'Basic', total_orders: 3421, unique_customers: 2145, total_revenue: 625000, avg_order_value: 182.69, revenue_per_customer: 291.38 }
    ],
    chartType: 'bar',
    chartConfig: {
      xKey: 'segment',
      yKey: 'avg_order_value',
      title: 'Average Order Value by Customer Segment'
    },
    highlights: [
      { icon: '💎', label: 'High Value', value: 'Enterprise: $1,879 AOV (10x Basic)', type: 'success' },
      { icon: '🎯', label: 'Sweet Spot', value: 'Premium: 456 customers, $2.16M revenue', type: 'info' },
      { icon: '🚀', label: 'Action Item', value: 'Upgrade Premium → Enterprise for $1M+ gain', type: 'warning' }
    ],
    explanation: `## Summary
Enterprise segment shows dramatically higher AOV at $1,879.52, nearly 2.5x higher than Premium segment and 10x higher than Basic segment.

## Key Insights
- **Enterprise dominates value**: Despite only 89 customers, Enterprise generates $2.34M (33% of total revenue)
- **Revenue concentration**: Enterprise customers average $26K lifetime value vs $291 for Basic
- **Premium sweet spot**: 456 Premium customers generate nearly as much as 1,834 Standard customers

## Recommendations
1. **Prioritize Enterprise retention**: Losing even one Enterprise customer = losing 90 Basic customers in revenue
2. **Upgrade path from Premium**: Create targeted campaigns to move Premium customers to Enterprise tier
3. **Basic segment efficiency**: Automate Basic customer service to maintain profitability at lower AOV`
  },
  "compare year-over-year revenue growth": {
    sql: `SELECT 
  DATE_TRUNC('month', sale_date) as month,
  EXTRACT(YEAR FROM sale_date) as year,
  SUM(revenue) as monthly_revenue,
  LAG(SUM(revenue)) OVER (PARTITION BY EXTRACT(MONTH FROM sale_date) ORDER BY EXTRACT(YEAR FROM sale_date)) as prev_year_revenue,
  ROUND(((SUM(revenue) - LAG(SUM(revenue)) OVER (PARTITION BY EXTRACT(MONTH FROM sale_date) ORDER BY EXTRACT(YEAR FROM sale_date))) / 
         LAG(SUM(revenue)) OVER (PARTITION BY EXTRACT(MONTH FROM sale_date) ORDER BY EXTRACT(YEAR FROM sale_date))) * 100, 2) as yoy_growth_pct
FROM sales
WHERE sale_date >= CURRENT_DATE - INTERVAL '2 years'
GROUP BY DATE_TRUNC('month', sale_date), EXTRACT(YEAR FROM sale_date)
ORDER BY month DESC
LIMIT 12;`,
    results: [
      { month: '2026-02-01', year: 2026, monthly_revenue: 1245000, prev_year_revenue: 1089000, yoy_growth_pct: 14.32 },
      { month: '2026-01-01', year: 2026, monthly_revenue: 1156000, prev_year_revenue: 1023000, yoy_growth_pct: 13.00 },
      { month: '2025-12-01', year: 2025, monthly_revenue: 1523000, prev_year_revenue: 1287000, yoy_growth_pct: 18.34 },
      { month: '2025-11-01', year: 2025, monthly_revenue: 1398000, prev_year_revenue: 1198000, yoy_growth_pct: 16.69 },
      { month: '2025-10-01', year: 2025, monthly_revenue: 1287000, prev_year_revenue: 1134000, yoy_growth_pct: 13.49 },
      { month: '2025-09-01', year: 2025, monthly_revenue: 1198000, prev_year_revenue: 1067000, yoy_growth_pct: 12.28 }
    ],
    chartType: 'line',
    chartConfig: {
      xKey: 'month',
      yKey: 'yoy_growth_pct',
      title: 'Year-over-Year Growth Trend'
    },
    highlights: [
      { icon: '🚀', label: 'Peak Performance', value: 'December: +18.34% YoY growth', type: 'success' },
      { icon: '📈', label: 'Consistent Growth', value: 'All months above +12% YoY', type: 'success' },
      { icon: '💡', label: 'Next Step', value: 'Target 15% YoY for 2026 based on trend', type: 'info' }
    ],
    explanation: `## Summary
Strong year-over-year growth trend with consistent double-digit increases. December 2025 showed exceptional performance with 18.34% YoY growth.

## Key Insights
- **Accelerating growth**: Growth rate increased from 12.28% (Sept) to 18.34% (Dec), showing positive momentum
- **Holiday season strength**: Q4 2025 outperformed Q4 2024 by 16%+ across all months
- **Sustained performance**: All months show positive YoY growth above 12%, indicating healthy business trajectory

## Recommendations
1. **Capitalize on momentum**: Current growth rate suggests opportunity to increase inventory and marketing spend
2. **Analyze December drivers**: Investigate what drove 18% growth to replicate in other periods
3. **Set realistic targets**: Based on trend, aim for 15% YoY growth for 2026 overall`
  }
};

// Smart chart selector based on data structure
const determineChartType = (results) => {
  if (!results || results.length === 0) return null;
  
  const keys = Object.keys(results[0]);
  const numericKeys = keys.filter(k => typeof results[0][k] === 'number');
  
  // If we have time series data (month, year, date in keys)
  if (keys.some(k => k.includes('month') || k.includes('year') || k.includes('date'))) {
    return 'line';
  }
  
  // If we have categories and numeric values
  if (keys.length <= 5 && numericKeys.length >= 1) {
    return 'bar';
  }
  
  return 'bar'; // default
};

// Chart component
const DataChart = ({ data, chartType, config }) => {
  if (!data || data.length === 0) return null;

  const formatValue = (value) => {
    if (typeof value === 'number') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
      return value.toLocaleString();
    }
    return value;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Prepare data for charts
  const chartData = data.map(item => {
    const formatted = { ...item };
    // Format dates if present
    Object.keys(formatted).forEach(key => {
      if (key.includes('month') && typeof formatted[key] === 'string') {
        formatted[key] = formatDate(formatted[key]);
      }
    });
    return formatted;
  });

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLine data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey={config.xKey} 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={formatValue}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0'
            }}
            formatter={formatValue}
          />
          <Legend wrapperStyle={{ color: '#94a3b8' }} />
          <Line 
            type="monotone" 
            dataKey={config.yKey} 
            stroke="#06b6d4" 
            strokeWidth={3}
            dot={{ fill: '#06b6d4', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </RechartsLine>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey={config.xKey} 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={formatValue}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0'
            }}
            formatter={formatValue}
          />
          <Legend wrapperStyle={{ color: '#94a3b8' }} />
          <Bar dataKey={config.yKey} fill="#06b6d4" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

export default function AnalyticsAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const chartRef = useRef(null);

  // Load query history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('queryHistory');
    if (saved) {
      try {
        setQueryHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load query history:', e);
      }
    }
  }, []);

  // Save to history
  const saveToHistory = (question) => {
    const newEntry = {
      id: Date.now(),
      question,
      timestamp: new Date().toISOString()
    };
    const newHistory = [newEntry, ...queryHistory.slice(0, 9)]; // Keep last 10
    setQueryHistory(newHistory);
    localStorage.setItem('queryHistory', JSON.stringify(newHistory));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateSQL = async (question) => {
    setLoading(true);
    
    // Check if we have a demo response for this question
    const normalizedQuestion = question.toLowerCase().trim();
    const demoResponse = DEMO_RESPONSES[normalizedQuestion];
    
    if (demoResponse) {
      return demoResponse;
    }
    
    // Try fuzzy matching for similar questions
    for (const [key, value] of Object.entries(DEMO_RESPONSES)) {
      if (normalizedQuestion.includes(key.split(' ').slice(0, 3).join(' '))) {
        return value;
      }
    }
    
    // Default response for unmatched questions
    return {
      sql: `SELECT * FROM sales LIMIT 10;`,
      results: [
        { sale_id: 1, product_id: 'P001', customer_id: 'C123', revenue: 1200, region: 'North' },
        { sale_id: 2, product_id: 'P045', customer_id: 'C456', revenue: 200, region: 'South' },
        { sale_id: 3, product_id: 'P023', customer_id: 'C789', revenue: 400, region: 'East' }
      ],
      chartType: null,
      explanation: `This is a demo response. Try asking one of the example questions above for detailed AI-generated insights!\n\nThis demo showcases:\n✅ SQL query generation\n✅ Data visualization\n✅ AI-powered analysis\n\nFor production use with your real database, you would connect the Claude API.`
    };
  };

  const handleSubmit = async (e, customQuestion = null) => {
    e?.preventDefault();
    const question = customQuestion || input;
    if (!question.trim()) return;

    // Save to history
    saveToHistory(question);

    // Add user message
    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Generate SQL and get response
    const response = await generateSQL(question);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      sql: response.sql,
      results: response.results,
      chartType: response.chartType,
      chartConfig: response.chartConfig,
      highlights: response.highlights,
      explanation: response.explanation
    }]);

    setLoading(false);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportReport = async (msg, question) => {
    try {
      // Capture chart as image
      let chartImageData = '';
      
      if (msg.chartType) {
        try {
          // Find the Recharts SVG element
          const svgElement = document.querySelector('.recharts-wrapper svg');
          
          if (svgElement) {
            // Clone the SVG to avoid modifying the original
            const clonedSvg = svgElement.cloneNode(true);
            
            // Get SVG dimensions
            const bbox = svgElement.getBBox();
            const width = bbox.width || 800;
            const height = bbox.height || 400;
            
            // Set explicit dimensions on cloned SVG
            clonedSvg.setAttribute('width', width);
            clonedSvg.setAttribute('height', height);
            clonedSvg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${width} ${height}`);
            
            // Serialize SVG to string
            const svgString = new XMLSerializer().serializeToString(clonedSvg);
            
            // Convert to base64
            chartImageData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
            
            console.log('✅ Chart captured successfully');
          }
        } catch (error) {
          console.warn('Chart capture failed:', error);
        }
      }

      // Create HTML report
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Analytics Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
    .header h1 { margin: 0 0 10px 0; font-size: 32px; }
    .header p { margin: 0; font-size: 18px; opacity: 0.9; }
    .section { background: white; padding: 25px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .section-title { font-size: 22px; font-weight: bold; color: #0f172a; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #06b6d4; }
    .chart-container { background: #0f172a; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .chart-container img { max-width: 100%; height: auto; }
    .highlights { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
    .highlight { padding: 20px; border-radius: 8px; border-left: 4px solid; }
    .highlight.success { background: #f0fdf4; border-color: #10b981; }
    .highlight.warning { background: #fffbeb; border-color: #f59e0b; }
    .highlight.info { background: #ecfeff; border-color: #06b6d4; }
    .highlight-icon { font-size: 24px; margin-bottom: 8px; }
    .highlight-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 5px; }
    .highlight-value { font-size: 15px; font-weight: 600; color: #0f172a; }
    .sql-block { background: #0f172a; color: #10b981; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 13px; overflow-x: auto; white-space: pre-wrap; }
    .insights { background: linear-gradient(135deg, #ecfeff, #e0f2fe); padding: 25px; border-radius: 8px; border: 2px solid #06b6d4; line-height: 1.8; }
    .insights h3 { color: #0e7490; margin: 15px 0 10px 0; }
    .insights p { margin-bottom: 10px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #cbd5e1; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    tr:hover { background: #f8fafc; }
    .meta { color: #64748b; font-size: 14px; margin-bottom: 20px; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 AI Analytics Report</h1>
    <p>${question}</p>
  </div>
  
  <div class="meta">
    <strong>Generated:</strong> ${new Date().toLocaleString()} | 
    <strong>Data Points:</strong> ${msg.results?.length || 0} rows
  </div>

  ${chartImageData ? `
  <div class="section">
    <div class="section-title">📊 ${msg.chartConfig?.title || 'Data Visualization'}</div>
    <div class="chart-container">
      <img src="${chartImageData}" alt="Chart visualization" />
    </div>
  </div>
  ` : ''}

  ${msg.explanation ? `
  <div class="section">
    <div class="section-title">🤖 AI Insights</div>
    <div class="insights">
      ${msg.explanation.split('\n').map(line => {
        line = line.trim();
        if (line.startsWith('## ')) return `<h3>${line.replace('## ', '')}</h3>`;
        else if (line.startsWith('- ')) return `<p>• ${line.replace('- ', '')}</p>`;
        else if (line) return `<p>${line}</p>`;
        return '';
      }).join('')}
    </div>
  </div>
  ` : ''}

  ${msg.highlights && msg.highlights.length > 0 ? `
  <div class="section">
    <div class="section-title">🎯 Key Takeaways</div>
    <div class="highlights">
      ${msg.highlights.map(h => `
        <div class="highlight ${h.type}">
          <div class="highlight-icon">${h.icon}</div>
          <div class="highlight-label">${h.label}</div>
          <div class="highlight-value">${h.value}</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">💻 Generated SQL Query</div>
    <div class="sql-block">${msg.sql}</div>
  </div>

  ${msg.results && msg.results.length > 0 ? `
  <div class="section">
    <div class="section-title">📋 Data Table (${msg.results.length} rows)</div>
    <table>
      <thead>
        <tr>
          ${Object.keys(msg.results[0]).map(key => 
            `<th>${key.replace(/_/g, ' ').toUpperCase()}</th>`
          ).join('')}
        </tr>
      </thead>
      <tbody>
        ${msg.results.map(row => `
          <tr>
            ${Object.values(row).map(val => 
              `<td>${typeof val === 'number' ? val.toLocaleString() : val}</td>`
            ).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="footer">
    <p><strong>AI Analytics Assistant v2.0</strong></p>
    <p>Powered by Claude AI • React • Recharts</p>
  </div>
</body>
</html>`;

      // Download HTML file
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Analytics_Report_${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ HTML report with chart downloaded successfully');
      
    } catch (err) {
      console.error('❌ Export error:', err);
      alert('Export failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMessages([])}
              className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer"
              title="Start new conversation"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Analytics Assistant</h1>
              <p className="text-xs text-slate-400">Ask questions, get SQL + insights + visuals</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-1 rounded-lg hover:bg-slate-800/50"
              >
                New Question
              </button>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-slate-400 hover:text-cyan-300 transition-colors px-3 py-1 rounded-lg hover:bg-slate-800/50 flex items-center gap-2"
              title="Query History"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
              {queryHistory.length > 0 && (
                <span className="bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {queryHistory.length}
                </span>
              )}
            </button>
            <div className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-xs border border-cyan-500/20 font-semibold">
              v2.0
            </div>
            <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs border border-green-500/20">
              Demo Mode
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Query History Sidebar */}
        {showHistory && (
          <div className="w-80 border-r border-slate-800 bg-slate-950/30 p-4 overflow-y-auto max-h-screen sticky top-16">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4" />
                Query History
              </h3>
              {queryHistory.length > 0 && (
                <button
                  onClick={() => {
                    setQueryHistory([]);
                    localStorage.removeItem('queryHistory');
                  }}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {queryHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent queries yet.</p>
                <p className="text-xs mt-1">Your question history will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {queryHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setShowHistory(false);
                      handleSubmit(null, item.question);
                    }}
                    className="w-full text-left p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/50 transition-all group"
                  >
                    <div className="text-sm text-slate-300 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                      {item.question}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      <div className="flex-1 max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        {messages.length === 0 && (
          <div className="mb-12 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-full text-sm mb-4 border border-cyan-500/20">
                <TrendingUp className="w-4 h-4" />
                AI-Powered Business Intelligence
              </div>
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Ask anything about your data
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Natural language to SQL + Interactive Charts + AI Insights
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={(e) => handleSubmit(e, q)}
                  className="text-left p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-800 transition-all duration-200 group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-cyan-400 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-slate-300 text-sm">{q}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Sample Schema
              </h3>
              <div className="space-y-2 text-sm font-mono">
                {Object.entries(SAMPLE_SCHEMA).map(([table, info]) => (
                  <div key={table} className="text-slate-400">
                    <span className="text-cyan-400">{table}</span>: {info.columns.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6 mb-6">
          {messages.map((msg, idx) => (
            <div key={idx} className="animate-fadeIn">
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-cyan-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-2xl shadow-lg">
                    {msg.content}
                  </div>
                </div>
              ) : msg.error ? (
                <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-red-300">{msg.content}</span>
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-4">
                  
                  {/* Export Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => exportReport(msg, messages[idx - 1]?.content || 'Analysis')}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <FileDown className="w-4 h-4" />
                      Export Report
                    </button>
                  </div>

                  {/* 1. Chart Visualization - FIRST */}
                  {msg.chartType && msg.results && msg.results.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-cyan-400 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        {msg.chartConfig?.title || 'Data Visualization'}
                      </h4>
                      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                        <DataChart 
                          data={msg.results} 
                          chartType={msg.chartType}
                          config={msg.chartConfig}
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. AI Explanation - SECOND */}
                  {msg.explanation && (
                    <div className="bg-gradient-to-br from-cyan-950/30 to-blue-950/30 border border-cyan-800/30 rounded-lg p-4">
                      <h4 className="font-semibold text-sm text-cyan-300 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Insights
                      </h4>
                      <div className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                        {msg.explanation}
                      </div>
                    </div>
                  )}

                  {/* 3. Insight Highlights - THIRD */}
                  {msg.highlights && msg.highlights.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-cyan-400 mb-3">Key Takeaways</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {msg.highlights.map((highlight, i) => (
                          <div
                            key={i}
                            className={`p-4 rounded-lg border ${
                              highlight.type === 'success'
                                ? 'bg-green-500/10 border-green-500/30'
                                : highlight.type === 'warning'
                                ? 'bg-yellow-500/10 border-yellow-500/30'
                                : 'bg-cyan-500/10 border-cyan-500/30'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{highlight.icon}</span>
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                                  {highlight.label}
                                </div>
                                <div className={`text-sm font-medium ${
                                  highlight.type === 'success'
                                    ? 'text-green-300'
                                    : highlight.type === 'warning'
                                    ? 'text-yellow-300'
                                    : 'text-cyan-300'
                                }`}>
                                  {highlight.value}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Technical Details - COLLAPSIBLE at bottom */}
                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors border border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <svg 
                            className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-90" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-sm font-medium text-slate-300">View SQL Query & Raw Data</span>
                        </div>
                        <span className="text-xs text-slate-500">Click to expand</span>
                      </div>
                    </summary>
                    
                    <div className="mt-3 space-y-4">
                      {/* SQL Query */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm text-cyan-400">Generated SQL</h4>
                          <button
                            onClick={() => copyToClipboard(msg.sql, `sql-${idx}`)}
                            className="text-slate-400 hover:text-white transition-colors p-1 flex items-center gap-1 text-xs"
                          >
                            {copied === `sql-${idx}` ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-slate-800">
                          <code className="text-green-400">{msg.sql}</code>
                        </pre>
                      </div>

                      {/* Results Table */}
                      {msg.results && (
                        <div>
                          <h4 className="font-semibold text-sm text-cyan-400 mb-2">Raw Data ({msg.results.length} rows)</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-slate-700">
                                  {Object.keys(msg.results[0]).map(key => (
                                    <th key={key} className="text-left py-2 px-3 font-medium text-slate-300">
                                      {key.replace(/_/g, ' ').toUpperCase()}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {msg.results.map((row, i) => (
                                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                    {Object.values(row).map((val, j) => (
                                      <td key={j} className="py-2 px-3 text-slate-300">
                                        {typeof val === 'number' ? val.toLocaleString() : val}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </details>

                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <span className="text-sm">Analyzing your question...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="sticky bottom-6 max-w-4xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex items-center gap-3 p-2 focus-within:border-cyan-500/50 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your data..."
              className="flex-1 bg-transparent px-4 py-3 outline-none text-slate-100 placeholder-slate-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
