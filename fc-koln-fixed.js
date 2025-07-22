#!/usr/bin/env node

const http = require('http');
const url = require('url');

console.log('Starting Complete FC Köln Management System...');

// Complete FC Köln Management System HTML
const FC_KOLN_APP = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FC Köln International Talent Program</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #334155;
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .logout-btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .logout-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        /* Navigation */
        .nav {
            background: white;
            border-bottom: 1px solid #e2e8f0;
            padding: 0 2rem;
        }
        
        .nav-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
        }
        
        .nav-item {
            padding: 1rem 0;
            color: #64748b;
            text-decoration: none;
            border-bottom: 2px solid transparent;
            transition: all 0.3s;
            cursor: pointer;
        }
        
        .nav-item:hover,
        .nav-item.active {
            color: #dc2626;
            border-bottom-color: #dc2626;
        }
        
        /* Main Content */
        .main {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .page {
            display: none;
        }
        
        .page.active {
            display: block;
        }
        
        /* Dashboard */
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: white;
            border-radius: 10px;
            padding: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid #dc2626;
        }
        
        .card h3 {
            color: #dc2626;
            margin-bottom: 1rem;
            font-size: 1.25rem;
        }
        
        .stat {
            font-size: 2rem;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }
        
        /* Players Grid */
        .players-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .player-card {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        
        .player-card:hover {
            transform: translateY(-2px);
        }
        
        .player-name {
            font-size: 1.25rem;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }
        
        .player-details {
            color: #64748b;
            line-height: 1.6;
        }
        
        /* Forms */
        .form-section {
            background: white;
            border-radius: 10px;
            padding: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #374151;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #dc2626;
        }
        
        .btn {
            background: #dc2626;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #b91c1c;
        }
        
        .btn-secondary {
            background: #64748b;
        }
        
        .btn-secondary:hover {
            background: #475569;
        }
        
        /* Calendar */
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background: #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .calendar-day {
            background: white;
            padding: 1rem;
            min-height: 100px;
            position: relative;
        }
        
        .calendar-day.other-month {
            background: #f8fafc;
            color: #94a3b8;
        }
        
        .calendar-event {
            background: #dc2626;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            margin-top: 0.25rem;
        }
        
        /* Food Orders */
        .order-card {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
            border-left: 4px solid #10b981;
        }
        
        .order-status {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-confirmed {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-delivered {
            background: #dbeafe;
            color: #1e40af;
        }
        
        /* Enhanced Components Styles */
        .leaderboard {
            background: #f8fafc;
            border-radius: 10px;
            padding: 1rem;
        }
        
        .leaderboard-item {
            display: flex;
            align-items: center;
            padding: 0.75rem;
            margin: 0.5rem 0;
            background: white;
            border-radius: 8px;
            gap: 1rem;
        }
        
        .leaderboard-item.leader {
            border: 2px solid #fbbf24;
            background: linear-gradient(135deg, #fef3c7, #fbbf24);
        }
        
        .rank {
            font-weight: bold;
            min-width: 40px;
        }
        
        .house-name {
            flex: 1;
            font-weight: 600;
        }
        
        .points {
            font-weight: bold;
            color: #dc2626;
        }
        
        .progress-bar {
            width: 100px;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress {
            height: 100%;
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            transition: width 0.3s;
        }
        
        /* Alerts & Notifications */
        .alerts-grid {
            display: grid;
            gap: 1rem;
        }
        
        .alert-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid;
        }
        
        .alert-item.urgent {
            background: #fef2f2;
            border-left-color: #ef4444;
        }
        
        .alert-item.warning {
            background: #fffbeb;
            border-left-color: #f59e0b;
        }
        
        .alert-item.info {
            background: #eff6ff;
            border-left-color: #3b82f6;
        }
        
        /* AI Insights */
        .insights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }
        
        .insight-card {
            background: #f0f9ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 1rem;
        }
        
        /* Activity Timeline */
        .activity-timeline {
            background: #f8fafc;
            border-radius: 8px;
            padding: 1rem;
        }
        
        .activity-item {
            display: flex;
            gap: 1rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .timestamp {
            color: #6b7280;
            font-size: 0.875rem;
            min-width: 80px;
        }
        
        /* Player Table Styles */
        .filter-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .filter-input {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .stat-card {
            text-align: center;
            padding: 1.5rem;
            background: #f9fafb;
            border-radius: 8px;
        }
        
        .stat-large {
            font-size: 2rem;
            font-weight: bold;
            color: #dc2626;
            margin: 0.5rem 0;
        }
        
        .table-container {
            overflow-x: auto;
        }
        
        .player-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .player-table th,
        .player-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .player-table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
        }
        
        .player-info strong {
            color: #1f2937;
        }
        
        .house-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 600;
            color: white;
        }
        
        .house-badge.w1 { background: #dc2626; }
        .house-badge.w2 { background: #059669; }
        .house-badge.w3 { background: #3b82f6; }
        
        .attendance-good { color: #059669; font-weight: 600; }
        .attendance-warning { color: #d97706; font-weight: 600; }
        .fitness-score { color: #7c3aed; font-weight: 600; }
        
        .status-active { color: #059669; }
        .status-injured { color: #dc2626; }
        
        .btn-mini {
            background: #6b7280;
            color: white;
            border: none;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            cursor: pointer;
            margin-right: 0.25rem;
        }
        
        .btn-mini:hover {
            background: #4b5563;
        }
        
        /* Practice Excuse Styles */
        .excuse-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .excuse-category {
            text-align: center;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .excuse-count {
            font-size: 1.5rem;
            font-weight: bold;
            color: #dc2626;
            margin: 0.5rem 0;
        }
        
        .recent-excuses {
            margin-top: 1rem;
        }
        
        .excuse-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            margin: 0.5rem 0;
            border-radius: 6px;
            border-left: 4px solid;
        }
        
        .excuse-item.pending {
            background: #fef3c7;
            border-left-color: #f59e0b;
        }
        
        .excuse-item.approved {
            background: #d1fae5;
            border-left-color: #10b981;
        }
        
        /* Smart Chore Styles */
        .ai-controls {
            display: flex;
            gap: 1rem;
            margin: 1rem 0;
            flex-wrap: wrap;
        }
        
        .ai-status {
            background: #f0f9ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 1rem;
            margin-top: 1rem;
        }
        
        .chore-houses-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 1.5rem;
        }
        
        .house-chores {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .completion-rate {
            float: right;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .completion-rate.excellent {
            background: #d1fae5;
            color: #065f46;
        }
        
        .completion-rate.good {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .completion-rate.warning {
            background: #fef3c7;
            color: #92400e;
        }
        
        .chore-list {
            margin-top: 1rem;
        }
        
        .chore-item {
            display: grid;
            grid-template-columns: 2fr 1fr 80px 100px;
            gap: 0.5rem;
            align-items: center;
            padding: 0.75rem;
            margin: 0.5rem 0;
            background: #f9fafb;
            border-radius: 6px;
            font-size: 0.875rem;
        }
        
        .chore-item.completed {
            background: #f0fdf4;
            border-left: 3px solid #22c55e;
        }
        
        .chore-item.in-progress {
            background: #fffbeb;
            border-left: 3px solid #f59e0b;
        }
        
        .chore-item.overdue {
            background: #fef2f2;
            border-left: 3px solid #ef4444;
        }
        
        .chore-item.pending {
            background: #f8fafc;
            border-left: 3px solid #94a3b8;
        }
        
        .chore-name {
            font-weight: 600;
            color: #374151;
        }
        
        .assigned-to {
            color: #6b7280;
        }
        
        .chore-points {
            font-weight: 600;
            color: #059669;
        }
        
        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-align: center;
        }
        
        .status-badge.done {
            background: #dcfce7;
            color: #166534;
        }
        
        .status-badge.progress {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-badge.overdue {
            background: #fecaca;
            color: #991b1b;
        }
        
        .status-badge.pending {
            background: #f1f5f9;
            color: #475569;
        }
        
        /* Analytics Styles */
        .analytics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .analytics-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
        }
        
        .trend-chart {
            display: flex;
            align-items: end;
            gap: 0.5rem;
            height: 80px;
            margin: 1rem 0;
        }
        
        .chart-bar {
            flex: 1;
            background: linear-gradient(to top, #dc2626, #ef4444);
            border-radius: 2px;
            display: flex;
            align-items: end;
            justify-content: center;
            color: white;
            font-size: 0.75rem;
            padding: 0.25rem;
            font-weight: 600;
        }
        
        .fairness-meter {
            width: 100%;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin: 1rem 0;
        }
        
        .meter-fill {
            height: 100%;
            background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .points-breakdown {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin: 1rem 0;
        }
        
        .points-item {
            padding: 0.5rem;
            background: #f8fafc;
            border-radius: 4px;
            font-weight: 600;
        }
        
        /* Recommendations */
        .recommendations {
            display: grid;
            gap: 1rem;
        }
        
        .recommendation-item {
            background: #fefce8;
            border: 1px solid #fde047;
            border-radius: 8px;
            padding: 1rem;
        }
        
        .recommendation-item h4 {
            color: #a16207;
            margin-bottom: 0.5rem;
        }

        /* Admin Styles */
        .admin-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .tab-btn {
            background: none;
            border: none;
            padding: 0.75rem 1rem;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            color: #6b7280;
            font-weight: 500;
        }
        
        .tab-btn.active {
            color: #dc2626;
            border-bottom-color: #dc2626;
        }
        
        .admin-tab-content {
            display: none;
        }
        
        .admin-tab-content.active {
            display: block;
        }
        
        .users-list {
            display: grid;
            gap: 1rem;
        }
        
        .user-item {
            display: flex;
            justify-content: between;
            align-items: center;
            padding: 1rem;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            gap: 1rem;
        }
        
        .user-info {
            flex: 1;
        }
        
        .user-status {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .user-status.active {
            background: #d1fae5;
            color: #065f46;
        }
        
        .pending-approvals {
            display: grid;
            gap: 1rem;
        }
        
        .approval-item {
            background: #fffbeb;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 1.5rem;
        }
        
        .approval-actions {
            margin-top: 1rem;
            display: flex;
            gap: 0.5rem;
        }
        
        .roles-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .role-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
        }
        
        .analytics-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .analytics-stat {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #dc2626;
            margin: 0.5rem 0;
        }
        
        .settings-grid {
            display: grid;
            gap: 1rem;
        }
        
        .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
        }
        
        .setting-toggle {
            transform: scale(1.2);
        }
        
        .export-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        /* Registration Styles */
        .registration-types {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }
        
        .registration-type-btn {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            padding: 2rem;
            cursor: pointer;
            transition: all 0.3s;
            text-align: left;
        }
        
        .registration-type-btn.active {
            border-color: #dc2626;
            background: #fef2f2;
        }
        
        .registration-type-btn:hover {
            border-color: #dc2626;
        }
        
        .registration-form {
            display: none;
        }
        
        .registration-form.active {
            display: block;
        }
        
        .form-subsection {
            background: #f9fafb;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }
        
        .form-subsection h4 {
            color: #374151;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .checkbox-group {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .checkbox-group label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: normal;
        }

        /* Login Page Auth Tabs */
        .auth-tabs {
            display: flex;
            gap: 0;
            margin-bottom: 2rem;
            border-radius: 8px;
            overflow: hidden;
            background: #f1f5f9;
        }
        
        .auth-tab-btn {
            flex: 1;
            background: #f1f5f9;
            border: none;
            padding: 1rem;
            cursor: pointer;
            color: #64748b;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .auth-tab-btn.active {
            background: #dc2626;
            color: white;
        }
        
        .auth-tab-content {
            display: none;
        }
        
        .auth-tab-content.active {
            display: block;
        }

        /* Public Registration Styles */
        .registration-intro {
            text-align: center;
            color: #64748b;
            margin-bottom: 2rem;
            font-size: 16px;
        }
        
        .public-registration-types {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .public-registration-type-btn {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 1.5rem;
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;
        }
        
        .public-registration-type-btn.active {
            border-color: #dc2626;
            background: #fef2f2;
        }
        
        .public-registration-type-btn:hover {
            border-color: #dc2626;
        }
        
        .registration-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .public-registration-type-btn h4 {
            color: #1f2937;
            margin-bottom: 0.5rem;
        }
        
        .public-registration-type-btn p {
            color: #6b7280;
            font-size: 0.875rem;
        }
        
        .public-registration-form {
            display: none;
        }
        
        .public-registration-form.active {
            display: block;
        }
        
        .quick-registration-form {
            background: white;
            border-radius: 10px;
            padding: 2rem;
            border: 1px solid #e2e8f0;
        }
        
        .quick-registration-form h3 {
            color: #1f2937;
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        .form-note {
            margin-top: 1rem;
            font-size: 0.875rem;
            color: #6b7280;
            text-align: center;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 1rem;
            }
            
            .nav-content {
                flex-wrap: wrap;
                gap: 1rem;
            }
            
            .main {
                padding: 1rem;
            }
            
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .chore-houses-grid {
                grid-template-columns: 1fr;
            }
            
            .chore-item {
                grid-template-columns: 1fr;
                gap: 0.25rem;
            }
            
            .filter-grid {
                grid-template-columns: 1fr;
            }
            
            .ai-controls {
                flex-direction: column;
            }
        }
        
        /* Login Page */
        .login-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .login-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            padding: 60px 50px;
            width: 100%;
            max-width: 480px;
            text-align: center;
        }
        
        .login-logo {
            color: #dc2626;
            font-size: 36px;
            font-weight: 900;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .login-subtitle {
            color: #666666;
            font-size: 18px;
            margin-bottom: 50px;
            font-weight: 400;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    <!-- Login Page -->
    <div id="loginPage" class="login-container">
        <div class="login-card">
            <div class="login-logo">FC Köln</div>
            <div class="login-subtitle">International Talent Program<br>Management System</div>
            
            <!-- Login/Registration Tabs -->
            <div class="auth-tabs">
                <button class="auth-tab-btn active" onclick="showAuthTab('login')">Sign In</button>
                <button class="auth-tab-btn" onclick="showAuthTab('register')">Join Program</button>
            </div>
            
            <!-- Login Form -->
            <div id="login-auth-tab" class="auth-tab-content active">
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" value="max.bisinger@warubi-sports.com" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" value="ITP2024" required>
                    </div>
                    
                    <button type="submit" class="btn">Sign In</button>
                </form>
                
                <div id="loginMessage"></div>
            </div>
            
            <!-- Public Registration Tab -->
            <div id="register-auth-tab" class="auth-tab-content">
                <div class="public-registration">
                    <p class="registration-intro">Join the FC Köln International Talent Program</p>
                    
                    <!-- Registration Type Selection -->
                    <div class="public-registration-types">
                        <button class="public-registration-type-btn active" onclick="showPublicRegistrationType('player')">
                            <div class="registration-icon">⚽</div>
                            <h4>Player Application</h4>
                            <p>Ages 16-20, International talent program</p>
                        </button>
                        <button class="public-registration-type-btn" onclick="showPublicRegistrationType('staff')">
                            <div class="registration-icon">👨‍🏫</div>
                            <h4>Staff Application</h4>
                            <p>Coaching, admin, and support positions</p>
                        </button>
                    </div>

                    <!-- Quick Player Registration -->
                    <div id="public-player-registration" class="public-registration-form active">
                        <h3>Player Application Form</h3>
                        <form class="quick-registration-form" id="playerApplicationForm">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>First Name *</label>
                                    <input type="text" id="playerFirstName" required>
                                </div>
                                <div class="form-group">
                                    <label>Last Name *</label>
                                    <input type="text" id="playerLastName" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Email Address *</label>
                                    <input type="email" id="playerEmail" required>
                                </div>
                                <div class="form-group">
                                    <label>Phone Number *</label>
                                    <input type="tel" id="playerPhone" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date of Birth *</label>
                                    <input type="date" id="playerBirth" required>
                                </div>
                                <div class="form-group">
                                    <label>Nationality *</label>
                                    <select id="playerNationality" required>
                                        <option value="">Select nationality</option>
                                        <option>Germany</option>
                                        <option>Spain</option>
                                        <option>France</option>
                                        <option>Brazil</option>
                                        <option>Argentina</option>
                                        <option>Portugal</option>
                                        <option>Netherlands</option>
                                        <option>Italy</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Primary Position *</label>
                                    <select id="playerPosition" required>
                                        <option value="">Select position</option>
                                        <option>Goalkeeper</option>
                                        <option>Centre-Back</option>
                                        <option>Left-Back</option>
                                        <option>Right-Back</option>
                                        <option>Defensive Midfielder</option>
                                        <option>Central Midfielder</option>
                                        <option>Attacking Midfielder</option>
                                        <option>Left Winger</option>
                                        <option>Right Winger</option>
                                        <option>Striker</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Previous Club</label>
                                    <input type="text" id="playerPreviousClub" placeholder="Most recent club">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Why do you want to join FC Köln? *</label>
                                <textarea rows="3" id="playerMotivation" placeholder="Tell us about your football ambitions and why you're interested in our program" required></textarea>
                            </div>
                            
                            <button type="button" class="btn btn-primary" onclick="submitPlayerApplication()">Submit Player Application</button>
                            <p class="form-note">* After submission, you'll receive an email with next steps and a detailed application form.</p>
                        </form>
                    </div>

                    <!-- Quick Staff Registration -->
                    <div id="public-staff-registration" class="public-registration-form">
                        <h3>Staff Application Form</h3>
                        <form class="quick-registration-form" id="staffApplicationForm">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>First Name *</label>
                                    <input type="text" id="staffFirstName" required>
                                </div>
                                <div class="form-group">
                                    <label>Last Name *</label>
                                    <input type="text" id="staffLastName" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Email Address *</label>
                                    <input type="email" id="staffEmail" required>
                                </div>
                                <div class="form-group">
                                    <label>Phone Number *</label>
                                    <input type="tel" id="staffPhone" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Position Applied For *</label>
                                    <select id="staffPosition" required>
                                        <option value="">Select position</option>
                                        <option>Head Coach</option>
                                        <option>Assistant Coach</option>
                                        <option>Fitness Coach</option>
                                        <option>Goalkeeper Coach</option>
                                        <option>Youth Development Coach</option>
                                        <option>Sports Psychologist</option>
                                        <option>Physiotherapist</option>
                                        <option>Nutritionist</option>
                                        <option>House Manager</option>
                                        <option>Administrative Staff</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Years of Experience *</label>
                                    <input type="number" id="staffExperience" min="0" max="50" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Relevant Experience *</label>
                                <textarea rows="3" id="staffExperienceDetail" placeholder="Describe your football coaching/management experience" required></textarea>
                            </div>
                            <div class="form-group">
                                <label>Qualifications</label>
                                <input type="text" id="staffQualifications" placeholder="UEFA licenses, degrees, certifications">
                            </div>
                            
                            <button type="button" class="btn btn-primary" onclick="submitStaffApplication()">Submit Staff Application</button>
                            <p class="form-note">* After submission, you'll be contacted for an interview and detailed application process.</p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Application -->
    <div id="mainApp" style="display: none;">
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <div class="logo">FC Köln Management</div>
                <div class="user-info">
                    <span id="userName">Welcome</span>
                    <button class="logout-btn" onclick="logout()">Logout</button>
                </div>
            </div>
        </header>

        <!-- Navigation -->
        <nav class="nav">
            <div class="nav-content">
                <a class="nav-item active" onclick="showPage('dashboard')">Dashboard</a>
                <a class="nav-item" onclick="showPage('players')">Players</a>
                <a class="nav-item" onclick="showPage('chores')">Chores</a>
                <a class="nav-item" onclick="showPage('calendar')">Calendar</a>
                <a class="nav-item" onclick="showPage('food-orders')">Food Orders</a>
                <a class="nav-item" onclick="showPage('communications')">Communications</a>
                <a class="nav-item" onclick="showPage('house-management')">House Management</a>
                <a class="nav-item" onclick="showPage('admin')">Admin</a>
                <a class="nav-item" onclick="showPage('registration')">Registration</a>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="main">
            <!-- Dashboard Page -->
            <div id="dashboard" class="page active">
                <h1>FC Köln Dashboard</h1>
                
                <!-- Key Metrics -->
                <div class="dashboard-grid">
                    <div class="card">
                        <h3>Total Players</h3>
                        <div class="stat">24</div>
                        <p>Active talent program participants</p>
                        <small>↗ +2 new this week</small>
                    </div>
                    <div class="card">
                        <h3>House Competition</h3>
                        <div class="stat">🏆 W2</div>
                        <p>Widdersdorf 2 leading with 425 pts</p>
                        <small>Weekly challenge: Fitness Goals</small>
                    </div>
                    <div class="card">
                        <h3>Attendance Rate</h3>
                        <div class="stat">92%</div>
                        <p>Training session participation</p>
                        <small>↗ +5% from last month</small>
                    </div>
                    <div class="card">
                        <h3>Smart Notifications</h3>
                        <div class="stat">3</div>
                        <p>Pending approvals & alerts</p>
                        <small>Practice excuses, meal requests</small>
                    </div>
                </div>

                <!-- House Competition Leaderboard -->
                <div class="form-section">
                    <h3>🏆 House Competition Leaderboard</h3>
                    <div class="leaderboard">
                        <div class="leaderboard-item leader">
                            <span class="rank">1st</span>
                            <span class="house-name">Widdersdorf 2</span>
                            <span class="points">425 pts</span>
                            <div class="progress-bar">
                                <div class="progress" style="width: 100%;"></div>
                            </div>
                        </div>
                        <div class="leaderboard-item">
                            <span class="rank">2nd</span>
                            <span class="house-name">Widdersdorf 1</span>
                            <span class="points">380 pts</span>
                            <div class="progress-bar">
                                <div class="progress" style="width: 89%;"></div>
                            </div>
                        </div>
                        <div class="leaderboard-item">
                            <span class="rank">3rd</span>
                            <span class="house-name">Widdersdorf 3</span>
                            <span class="points">345 pts</span>
                            <div class="progress-bar">
                                <div class="progress" style="width: 81%;"></div>
                            </div>
                        </div>
                    </div>
                    <p><strong>This Week:</strong> Fitness Challenge (20 pts), Chore Completion (15 pts), Team Spirit (10 pts)</p>
                </div>

                <!-- Smart Alerts & Notifications -->
                <div class="form-section">
                    <h3>🔔 Smart Alerts & Pending Actions</h3>
                    <div class="alerts-grid">
                        <div class="alert-item urgent">
                            <strong>Practice Excuse:</strong> Max Mueller - Family emergency
                            <button class="btn-mini">Review</button>
                        </div>
                        <div class="alert-item warning">
                            <strong>Chore Overdue:</strong> Bathroom cleaning - Widdersdorf 3
                            <button class="btn-mini">Reassign</button>
                        </div>
                        <div class="alert-item info">
                            <strong>Food Request:</strong> Dietary accommodation - Ahmed Hassan
                            <button class="btn-mini">Approve</button>
                        </div>
                    </div>
                </div>

                <!-- AI Insights -->
                <div class="form-section">
                    <h3>🤖 AI Performance Insights</h3>
                    <div class="insights-grid">
                        <div class="insight-card">
                            <h4>Training Optimization</h4>
                            <p>Players show 15% better performance on Wednesdays. Consider scheduling key drills mid-week.</p>
                        </div>
                        <div class="insight-card">
                            <h4>House Dynamics</h4>
                            <p>Widdersdorf 2's success correlates with balanced chore rotation and peer mentoring system.</p>
                        </div>
                        <div class="insight-card">
                            <h4>Nutrition Impact</h4>
                            <p>Players with consistent meal timing show 8% better stamina scores in afternoon sessions.</p>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity Feed -->
                <div class="form-section">
                    <h3>📊 Recent Activity & Analytics</h3>
                    <div class="activity-timeline">
                        <div class="activity-item">
                            <span class="timestamp">2 min ago</span>
                            <strong>Smart Chore Assignment:</strong> AI assigned kitchen duties based on availability and fairness
                        </div>
                        <div class="activity-item">
                            <span class="timestamp">15 min ago</span>
                            <strong>Performance Update:</strong> Carlos Rodriguez improved sprint time by 0.3 seconds
                        </div>
                        <div class="activity-item">
                            <span class="timestamp">1 hour ago</span>
                            <strong>House Points:</strong> Widdersdorf 1 earned 25 points for team meal preparation
                        </div>
                        <div class="activity-item">
                            <span class="timestamp">3 hours ago</span>
                            <strong>Attendance Alert:</strong> 100% attendance achieved for morning training session
                        </div>
                    </div>
                </div>
            </div>

            <!-- Players Page -->
            <div id="players" class="page">
                <h1>Player Management & Analytics</h1>
                
                <!-- Advanced Filters & Search -->
                <div class="form-section">
                    <h3>🔍 Advanced Player Search & Filters</h3>
                    <div class="filter-grid">
                        <input type="text" placeholder="Search players..." class="filter-input">
                        <select class="filter-input">
                            <option>All Houses</option>
                            <option>Widdersdorf 1</option>
                            <option>Widdersdorf 2</option>
                            <option>Widdersdorf 3</option>
                        </select>
                        <select class="filter-input">
                            <option>All Positions</option>
                            <option>Goalkeeper</option>
                            <option>Defender</option>
                            <option>Midfielder</option>
                            <option>Forward</option>
                        </select>
                        <select class="filter-input">
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Injured</option>
                            <option>On Leave</option>
                        </select>
                    </div>
                </div>

                <!-- Player Statistics Overview -->
                <div class="form-section">
                    <h3>📈 Performance Analytics</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h4>Attendance Rate</h4>
                            <div class="stat-large">94.2%</div>
                            <small>Avg. across all players</small>
                        </div>
                        <div class="stat-card">
                            <h4>Fitness Score</h4>
                            <div class="stat-large">8.6/10</div>
                            <small>Based on recent assessments</small>
                        </div>
                        <div class="stat-card">
                            <h4>House Points Earned</h4>
                            <div class="stat-large">1,150</div>
                            <small>Total points this month</small>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Player Table -->
                <div class="form-section">
                    <h3>👥 Player Database</h3>
                    <div class="table-container">
                        <table class="player-table">
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th>Position</th>
                                    <th>House</th>
                                    <th>Attendance</th>
                                    <th>Fitness</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div class="player-info">
                                            <strong>Max Mueller</strong><br>
                                            <small>Germany, Age 17</small>
                                        </div>
                                    </td>
                                    <td>Midfielder</td>
                                    <td><span class="house-badge w1">W1</span></td>
                                    <td><span class="attendance-good">96%</span></td>
                                    <td><span class="fitness-score">9.2</span></td>
                                    <td><span class="status-active">Active</span></td>
                                    <td>
                                        <button class="btn-mini">View</button>
                                        <button class="btn-mini">Edit</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="player-info">
                                            <strong>Ahmed Hassan</strong><br>
                                            <small>Egypt, Age 18</small>
                                        </div>
                                    </td>
                                    <td>Forward</td>
                                    <td><span class="house-badge w2">W2</span></td>
                                    <td><span class="attendance-good">94%</span></td>
                                    <td><span class="fitness-score">8.8</span></td>
                                    <td><span class="status-active">Active</span></td>
                                    <td>
                                        <button class="btn-mini">View</button>
                                        <button class="btn-mini">Edit</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="player-info">
                                            <strong>Carlos Rodriguez</strong><br>
                                            <small>Spain, Age 17</small>
                                        </div>
                                    </td>
                                    <td>Defender</td>
                                    <td><span class="house-badge w3">W3</span></td>
                                    <td><span class="attendance-warning">88%</span></td>
                                    <td><span class="fitness-score">8.1</span></td>
                                    <td><span class="status-injured">Injured</span></td>
                                    <td>
                                        <button class="btn-mini">View</button>
                                        <button class="btn-mini">Edit</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="player-info">
                                            <strong>Luis Garcia</strong><br>
                                            <small>Argentina, Age 16</small>
                                        </div>
                                    </td>
                                    <td>Midfielder</td>
                                    <td><span class="house-badge w2">W2</span></td>
                                    <td><span class="attendance-good">98%</span></td>
                                    <td><span class="fitness-score">9.5</span></td>
                                    <td><span class="status-active">Active</span></td>
                                    <td>
                                        <button class="btn-mini">View</button>
                                        <button class="btn-mini">Edit</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="player-info">
                                            <strong>Alex Schmidt</strong><br>
                                            <small>Germany, Age 17</small>
                                        </div>
                                    </td>
                                    <td>Goalkeeper</td>
                                    <td><span class="house-badge w1">W1</span></td>
                                    <td><span class="attendance-good">92%</span></td>
                                    <td><span class="fitness-score">8.7</span></td>
                                    <td><span class="status-active">Active</span></td>
                                    <td>
                                        <button class="btn-mini">View</button>
                                        <button class="btn-mini">Edit</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Practice Excuse Management -->
                <div class="form-section">
                    <h3>📝 Practice Excuse Statistics</h3>
                    <div class="excuse-stats">
                        <div class="excuse-category">
                            <h4>Illness</h4>
                            <div class="excuse-count">8 requests</div>
                            <small>Most common this month</small>
                        </div>
                        <div class="excuse-category">
                            <h4>Family Emergency</h4>
                            <div class="excuse-count">3 requests</div>
                            <small>All approved</small>
                        </div>
                        <div class="excuse-category">
                            <h4>Academic Conflict</h4>
                            <div class="excuse-count">5 requests</div>
                            <small>Exam periods</small>
                        </div>
                        <div class="excuse-category">
                            <h4>Medical Appointment</h4>
                            <div class="excuse-count">4 requests</div>
                            <small>Routine check-ups</small>
                        </div>
                    </div>
                    
                    <div class="recent-excuses">
                        <h4>Recent Excuse Requests</h4>
                        <div class="excuse-item pending">
                            <strong>Max Mueller</strong> - Family emergency (Today)
                            <button class="btn-mini">Approve</button>
                            <button class="btn-mini">Decline</button>
                        </div>
                        <div class="excuse-item approved">
                            <strong>Carlos Rodriguez</strong> - Medical appointment (Yesterday) - Approved
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chores Page -->
            <div id="chores" class="page">
                <h1>🤖 Smart Chore Management System</h1>

                <!-- AI Rotation Controls -->
                <div class="form-section">
                    <h3>🧠 AI-Powered Chore Rotation</h3>
                    <p>Our smart system automatically assigns chores based on fairness, skill level, availability, and house points balance.</p>
                    <div class="ai-controls">
                        <button class="btn">🔄 Generate New Rotation</button>
                        <button class="btn btn-secondary">⚖️ Balance Workload</button>
                        <button class="btn btn-secondary">📊 View Fairness Report</button>
                    </div>
                    <div class="ai-status">
                        <p><strong>Last AI Update:</strong> Today at 6:00 AM</p>
                        <p><strong>Fairness Score:</strong> 94% (Excellent balance across all houses)</p>
                        <p><strong>Next Auto-Rotation:</strong> Sunday 11:59 PM</p>
                    </div>
                </div>

                <!-- Smart Chore Assignments -->
                <div class="form-section">
                    <h3>📋 Current Week Assignments (AI Optimized)</h3>
                    <div class="chore-houses-grid">
                        <div class="house-chores">
                            <h4>🏠 Widdersdorf 1 <span class="completion-rate good">95% Complete</span></h4>
                            <div class="chore-list">
                                <div class="chore-item completed">
                                    <span class="chore-name">Kitchen Deep Clean</span>
                                    <span class="assigned-to">Max Mueller</span>
                                    <span class="chore-points">+15 pts</span>
                                    <span class="status-badge done">✓ Done</span>
                                </div>
                                <div class="chore-item completed">
                                    <span class="chore-name">Bathroom Maintenance</span>
                                    <span class="assigned-to">Alex Schmidt</span>
                                    <span class="chore-points">+10 pts</span>
                                    <span class="status-badge done">✓ Done</span>
                                </div>
                                <div class="chore-item in-progress">
                                    <span class="chore-name">Common Area Vacuum</span>
                                    <span class="assigned-to">Jan Weber</span>
                                    <span class="chore-points">+8 pts</span>
                                    <span class="status-badge progress">⏳ In Progress</span>
                                </div>
                                <div class="chore-item completed">
                                    <span class="chore-name">Trash & Recycling</span>
                                    <span class="assigned-to">Tom Fischer</span>
                                    <span class="chore-points">+5 pts</span>
                                    <span class="status-badge done">✓ Done</span>
                                </div>
                            </div>
                        </div>

                        <div class="house-chores">
                            <h4>🏠 Widdersdorf 2 <span class="completion-rate excellent">100% Complete</span></h4>
                            <div class="chore-list">
                                <div class="chore-item completed">
                                    <span class="chore-name">Kitchen Deep Clean</span>
                                    <span class="assigned-to">Ahmed Hassan</span>
                                    <span class="chore-points">+15 pts</span>
                                    <span class="status-badge done">✓ Done</span>
                                </div>
                                <div class="chore-item completed">
                                    <span class="chore-name">Bathroom Maintenance</span>
                                    <span class="assigned-to">Luis Garcia</span>
                                    <span class="chore-points">+10 pts</span>
                                    <span class="status-badge done">✓ Done</span>
                                </div>
                                <div class="chore-item completed">
                                    <span class="chore-name">Common Area Vacuum</span>
                                    <span class="assigned-to">Omar Al-Rashid</span>
                                    <span class="chore-points">+8 pts</span>
                                    <span class="status-badge done">✓ Done</span>
                                </div>
                                <div class="chore-item completed">
                                    <span class="chore-name">Laundry Room</span>
                                    <span class="assigned-to">Marco Silva</span>
                                    <span class="chore-points">+7 pts</span>
                                    <span class="status-badge done">✓ Done</span>
                                </div>
                            </div>
                        </div>

                        <div class="house-chores">
                            <h4>🏠 Widdersdorf 3 <span class="completion-rate warning">75% Complete</span></h4>
                            <div class="chore-list">
                                <div class="chore-item completed">
                                    <span class="chore-name">Kitchen Deep Clean</span>
                                    <span class="assigned-to">Carlos Rodriguez</span>
                                    <span class="chore-points">+15 pts</span>
                                    <span class="status-badge done">✓ Done</span>
                                </div>
                                <div class="chore-item overdue">
                                    <span class="chore-name">Bathroom Maintenance</span>
                                    <span class="assigned-to">Mike Brown</span>
                                    <span class="chore-points">+10 pts</span>
                                    <span class="status-badge overdue">⚠️ Overdue</span>
                                </div>
                                <div class="chore-item completed">
                                    <span class="chore-name">Garden Maintenance</span>
                                    <span class="assigned-to">Jean Dupont</span>
                                    <span class="chore-points">+12 pts</span>
                                    <span class="status-badge done">✓ Done</span>
                                </div>
                                <div class="chore-item pending">
                                    <span class="chore-name">Equipment Storage</span>
                                    <span class="assigned-to">Erik Johansson</span>
                                    <span class="chore-points">+6 pts</span>
                                    <span class="status-badge pending">📅 Scheduled</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chore Analytics & Insights -->
                <div class="form-section">
                    <h3>📊 Chore Performance Analytics</h3>
                    <div class="analytics-grid">
                        <div class="analytics-card">
                            <h4>Completion Trends</h4>
                            <div class="trend-chart">
                                <div class="chart-bar" style="height: 80%;">Mon</div>
                                <div class="chart-bar" style="height: 95%;">Tue</div>
                                <div class="chart-bar" style="height: 100%;">Wed</div>
                                <div class="chart-bar" style="height: 88%;">Thu</div>
                                <div class="chart-bar" style="height: 92%;">Fri</div>
                                <div class="chart-bar" style="height: 85%;">Sat</div>
                                <div class="chart-bar" style="height: 78%;">Sun</div>
                            </div>
                            <p>Peak performance: Wednesday</p>
                        </div>
                        
                        <div class="analytics-card">
                            <h4>AI Fairness Score</h4>
                            <div class="fairness-meter">
                                <div class="meter-fill" style="width: 94%;"></div>
                            </div>
                            <p>94% - Excellent balance</p>
                            <small>Based on workload distribution, player skills, and rotation history</small>
                        </div>

                        <div class="analytics-card">
                            <h4>House Points Impact</h4>
                            <div class="points-breakdown">
                                <div class="points-item">W1: +158 pts</div>
                                <div class="points-item">W2: +170 pts</div>
                                <div class="points-item">W3: +142 pts</div>
                            </div>
                            <p>Chore completion contribution to house competition</p>
                        </div>
                    </div>
                </div>

                <!-- Smart Recommendations -->
                <div class="form-section">
                    <h3>💡 AI Recommendations</h3>
                    <div class="recommendations">
                        <div class="recommendation-item">
                            <h4>Workload Balancing</h4>
                            <p>Mike Brown has missed 2 bathroom cleanings. System suggests reassigning to Luis Garcia with bonus points.</p>
                            <button class="btn-mini">Apply Suggestion</button>
                        </div>
                        <div class="recommendation-item">
                            <h4>Skill Optimization</h4>
                            <p>Ahmed Hassan shows excellent kitchen management. Consider assigning complex cooking prep tasks.</p>
                            <button class="btn-mini">Update Profile</button>
                        </div>
                        <div class="recommendation-item">
                            <h4>Motivation Boost</h4>
                            <p>Widdersdorf 3 completion rate dropped 10%. Suggest team building chore activity with bonus points.</p>
                            <button class="btn-mini">Schedule Activity</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Calendar Page -->
            <div id="calendar" class="page">
                <h1>Training Calendar</h1>
                <div class="form-section">
                    <h3>This Week's Schedule</h3>
                    <div class="calendar-grid">
                        <div class="calendar-day">
                            <strong>Mon</strong>
                            <div class="calendar-event">Training 3:00 PM</div>
                        </div>
                        <div class="calendar-day">
                            <strong>Tue</strong>
                        </div>
                        <div class="calendar-day">
                            <strong>Wed</strong>
                            <div class="calendar-event">Training 3:00 PM</div>
                        </div>
                        <div class="calendar-day">
                            <strong>Thu</strong>
                            <div class="calendar-event">Weight Lifting</div>
                        </div>
                        <div class="calendar-day">
                            <strong>Fri</strong>
                            <div class="calendar-event">Training 3:00 PM</div>
                        </div>
                        <div class="calendar-day">
                            <strong>Sat</strong>
                            <div class="calendar-event">Match 2:00 PM</div>
                        </div>
                        <div class="calendar-day">
                            <strong>Sun</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Food Orders Page -->
            <div id="food-orders" class="page">
                <h1>Food Order Management</h1>
                <div class="form-section">
                    <h3>Place New Order</h3>
                    <div class="form-group">
                        <label>House</label>
                        <select>
                            <option>Widdersdorf 1</option>
                            <option>Widdersdorf 2</option>
                            <option>Widdersdorf 3</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Delivery Date</label>
                        <select>
                            <option>Tuesday</option>
                            <option>Friday</option>
                        </select>
                    </div>
                    <button class="btn">Create Order</button>
                </div>
                
                <div class="order-card">
                    <h4>Widdersdorf 1 - Weekly Groceries</h4>
                    <p>Delivery: Tuesday, July 23</p>
                    <span class="order-status status-confirmed">Confirmed</span>
                </div>
                
                <div class="order-card">
                    <h4>Widdersdorf 2 - Weekly Groceries</h4>
                    <p>Delivery: Friday, July 26</p>
                    <span class="order-status status-pending">Pending</span>
                </div>
            </div>

            <!-- Communications Page -->
            <div id="communications" class="page">
                <h1>Team Communications</h1>
                <div class="form-section">
                    <h3>Send Team Message</h3>
                    <div class="form-group">
                        <label>Recipient Group</label>
                        <select>
                            <option>All Players</option>
                            <option>Widdersdorf 1</option>
                            <option>Widdersdorf 2</option>
                            <option>Widdersdorf 3</option>
                            <option>Coaching Staff</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Message</label>
                        <textarea rows="4" placeholder="Enter your message..."></textarea>
                    </div>
                    <button class="btn">Send Message</button>
                </div>
                
                <div class="form-section">
                    <h3>Recent Messages</h3>
                    <p><strong>Training Update:</strong> Tomorrow's session moved to 4:00 PM</p>
                    <p><strong>House Reminder:</strong> Please complete weekly chores by Sunday</p>
                    <p><strong>Match Announcement:</strong> Home match this Saturday vs. Borussia Dortmund U19</p>
                </div>
            </div>

            <!-- House Management Page -->
            <div id="house-management" class="page">
                <h1>House Management</h1>
                <div class="dashboard-grid">
                    <div class="card">
                        <h3>Widdersdorf 1</h3>
                        <p>Residents: 8 players</p>
                        <p>House Leader: Max Mueller</p>
                        <p>Chore Completion: 85%</p>
                    </div>
                    <div class="card">
                        <h3>Widdersdorf 2</h3>
                        <p>Residents: 8 players</p>
                        <p>House Leader: Ahmed Hassan</p>
                        <p>Chore Completion: 92%</p>
                    </div>
                    <div class="card">
                        <h3>Widdersdorf 3</h3>
                        <p>Residents: 8 players</p>
                        <p>House Leader: Carlos Rodriguez</p>
                        <p>Chore Completion: 78%</p>
                    </div>
                </div>
            </div>

            <!-- Admin Page -->
            <div id="admin" class="page">
                <h1>System Administration</h1>
                
                <!-- User Management -->
                <div class="form-section">
                    <h3>👥 User Management</h3>
                    <div class="admin-tabs">
                        <button class="tab-btn active" onclick="showAdminTab('users')">Active Users</button>
                        <button class="tab-btn" onclick="showAdminTab('pending')">Pending Approvals</button>
                        <button class="tab-btn" onclick="showAdminTab('roles')">Role Management</button>
                    </div>
                    
                    <div id="users-tab" class="admin-tab-content active">
                        <div class="users-list">
                            <div class="user-item">
                                <div class="user-info">
                                    <strong>Max Bisinger</strong><br>
                                    <small>max.bisinger@warubi-sports.com - Admin</small>
                                </div>
                                <div class="user-status active">Active</div>
                                <button class="btn-mini">Edit</button>
                            </div>
                            <div class="user-item">
                                <div class="user-info">
                                    <strong>Thomas Ellinger</strong><br>
                                    <small>thomas.ellinger@warubi-sports.com - Staff</small>
                                </div>
                                <div class="user-status active">Active</div>
                                <button class="btn-mini">Edit</button>
                            </div>
                            <div class="user-item">
                                <div class="user-info">
                                    <strong>Ahmed Hassan</strong><br>
                                    <small>ahmed.hassan@fckoln.de - Player</small>
                                </div>
                                <div class="user-status active">Active</div>
                                <button class="btn-mini">Edit</button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="pending-tab" class="admin-tab-content">
                        <div class="pending-approvals">
                            <div class="approval-item">
                                <div class="approval-info">
                                    <strong>New Registration: Luis Martinez</strong><br>
                                    <small>luis.martinez@email.com - Player Application</small>
                                    <p>Position: Forward, Age: 17, Nationality: Spain</p>
                                </div>
                                <div class="approval-actions">
                                    <button class="btn">Approve</button>
                                    <button class="btn btn-secondary">Reject</button>
                                    <button class="btn btn-secondary">Review</button>
                                </div>
                            </div>
                            <div class="approval-item">
                                <div class="approval-info">
                                    <strong>Staff Application: Maria Schmidt</strong><br>
                                    <small>maria.schmidt@email.com - Coaching Staff</small>
                                    <p>Role: Fitness Coach, Experience: 5 years</p>
                                </div>
                                <div class="approval-actions">
                                    <button class="btn">Approve</button>
                                    <button class="btn btn-secondary">Reject</button>
                                    <button class="btn btn-secondary">Review</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="roles-tab" class="admin-tab-content">
                        <div class="roles-grid">
                            <div class="role-card">
                                <h4>Admin</h4>
                                <p>Full system access</p>
                                <small>2 users assigned</small>
                            </div>
                            <div class="role-card">
                                <h4>Staff</h4>
                                <p>Management and oversight</p>
                                <small>5 users assigned</small>
                            </div>
                            <div class="role-card">
                                <h4>Player</h4>
                                <p>Basic access and profile</p>
                                <small>24 users assigned</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- System Analytics -->
                <div class="form-section">
                    <h3>📊 System Analytics</h3>
                    <div class="analytics-overview">
                        <div class="analytics-stat">
                            <h4>Total Registrations</h4>
                            <div class="stat-number">31</div>
                            <small>This month: +7</small>
                        </div>
                        <div class="analytics-stat">
                            <h4>Active Sessions</h4>
                            <div class="stat-number">18</div>
                            <small>Currently online</small>
                        </div>
                        <div class="analytics-stat">
                            <h4>System Uptime</h4>
                            <div class="stat-number">99.8%</div>
                            <small>Last 30 days</small>
                        </div>
                        <div class="analytics-stat">
                            <h4>Data Storage</h4>
                            <div class="stat-number">2.4GB</div>
                            <small>Used of 10GB</small>
                        </div>
                    </div>
                </div>
                
                <!-- System Settings -->
                <div class="form-section">
                    <h3>⚙️ System Configuration</h3>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label>Auto-approve player registrations</label>
                            <input type="checkbox" class="setting-toggle">
                        </div>
                        <div class="setting-item">
                            <label>Email notifications enabled</label>
                            <input type="checkbox" class="setting-toggle" checked>
                        </div>
                        <div class="setting-item">
                            <label>House competition active</label>
                            <input type="checkbox" class="setting-toggle" checked>
                        </div>
                        <div class="setting-item">
                            <label>AI chore rotation enabled</label>
                            <input type="checkbox" class="setting-toggle" checked>
                        </div>
                    </div>
                    <button class="btn">Save Settings</button>
                </div>
                
                <!-- Data Export -->
                <div class="form-section">
                    <h3>📁 Data Export & Backup</h3>
                    <div class="export-options">
                        <button class="btn">Export Player Data</button>
                        <button class="btn">Export House Statistics</button>
                        <button class="btn">Export System Logs</button>
                        <button class="btn btn-secondary">Full System Backup</button>
                    </div>
                </div>
            </div>

            <!-- Registration Page -->
            <div id="registration" class="page">
                <h1>New User Registration</h1>
                
                <!-- Registration Type Selection -->
                <div class="form-section">
                    <h3>👤 Registration Type</h3>
                    <div class="registration-types">
                        <button class="registration-type-btn active" onclick="showRegistrationType('player')">
                            <h4>⚽ Player Registration</h4>
                            <p>Join the FC Köln International Talent Program</p>
                        </button>
                        <button class="registration-type-btn" onclick="showRegistrationType('staff')">
                            <h4>👨‍🏫 Staff Registration</h4>
                            <p>Apply for coaching or administrative position</p>
                        </button>
                    </div>
                </div>

                <!-- Player Registration Form -->
                <div id="player-registration" class="registration-form active">
                    <div class="form-section">
                        <h3>⚽ Player Profile Creation</h3>
                        
                        <!-- Personal Information -->
                        <div class="form-subsection">
                            <h4>Personal Information</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>First Name *</label>
                                    <input type="text" required>
                                </div>
                                <div class="form-group">
                                    <label>Last Name *</label>
                                    <input type="text" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date of Birth *</label>
                                    <input type="date" required>
                                </div>
                                <div class="form-group">
                                    <label>Nationality *</label>
                                    <select required>
                                        <option value="">Select nationality</option>
                                        <option>Germany</option>
                                        <option>Spain</option>
                                        <option>France</option>
                                        <option>Brazil</option>
                                        <option>Argentina</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Email Address *</label>
                                <input type="email" required>
                            </div>
                            <div class="form-group">
                                <label>Phone Number</label>
                                <input type="tel">
                            </div>
                        </div>

                        <!-- Football Information -->
                        <div class="form-subsection">
                            <h4>Football Profile</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Primary Position *</label>
                                    <select required>
                                        <option value="">Select position</option>
                                        <option>Goalkeeper</option>
                                        <option>Centre-Back</option>
                                        <option>Left-Back</option>
                                        <option>Right-Back</option>
                                        <option>Defensive Midfielder</option>
                                        <option>Central Midfielder</option>
                                        <option>Attacking Midfielder</option>
                                        <option>Left Winger</option>
                                        <option>Right Winger</option>
                                        <option>Striker</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Secondary Position</label>
                                    <select>
                                        <option value="">Select secondary position</option>
                                        <option>Goalkeeper</option>
                                        <option>Centre-Back</option>
                                        <option>Left-Back</option>
                                        <option>Right-Back</option>
                                        <option>Defensive Midfielder</option>
                                        <option>Central Midfielder</option>
                                        <option>Attacking Midfielder</option>
                                        <option>Left Winger</option>
                                        <option>Right Winger</option>
                                        <option>Striker</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Preferred Foot</label>
                                    <select>
                                        <option>Right</option>
                                        <option>Left</option>
                                        <option>Both</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Height (cm)</label>
                                    <input type="number" min="150" max="220">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Previous Club(s)</label>
                                <textarea rows="3" placeholder="List your previous football clubs and years played"></textarea>
                            </div>
                        </div>

                        <!-- Housing Preferences -->
                        <div class="form-subsection">
                            <h4>Housing Preferences</h4>
                            <div class="form-group">
                                <label>Preferred House</label>
                                <select>
                                    <option value="">No preference</option>
                                    <option>Widdersdorf 1</option>
                                    <option>Widdersdorf 2</option>
                                    <option>Widdersdorf 3</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Dietary Requirements</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox"> Vegetarian</label>
                                    <label><input type="checkbox"> Vegan</label>
                                    <label><input type="checkbox"> Halal</label>
                                    <label><input type="checkbox"> Lactose Intolerant</label>
                                    <label><input type="checkbox"> Other allergies</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Special Requirements</label>
                                <textarea rows="3" placeholder="Any special accommodations needed"></textarea>
                            </div>
                        </div>

                        <!-- Emergency Contact -->
                        <div class="form-subsection">
                            <h4>Emergency Contact</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Contact Name *</label>
                                    <input type="text" required>
                                </div>
                                <div class="form-group">
                                    <label>Relationship *</label>
                                    <select required>
                                        <option value="">Select relationship</option>
                                        <option>Parent</option>
                                        <option>Guardian</option>
                                        <option>Sibling</option>
                                        <option>Other Family</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Phone Number *</label>
                                    <input type="tel" required>
                                </div>
                                <div class="form-group">
                                    <label>Email Address</label>
                                    <input type="email">
                                </div>
                            </div>
                        </div>

                        <button class="btn">Submit Player Registration</button>
                    </div>
                </div>

                <!-- Staff Registration Form -->
                <div id="staff-registration" class="registration-form">
                    <div class="form-section">
                        <h3>👨‍🏫 Staff Profile Creation</h3>
                        
                        <!-- Personal Information -->
                        <div class="form-subsection">
                            <h4>Personal Information</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>First Name *</label>
                                    <input type="text" required>
                                </div>
                                <div class="form-group">
                                    <label>Last Name *</label>
                                    <input type="text" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date of Birth *</label>
                                    <input type="date" required>
                                </div>
                                <div class="form-group">
                                    <label>Nationality *</label>
                                    <select required>
                                        <option value="">Select nationality</option>
                                        <option>Germany</option>
                                        <option>Spain</option>
                                        <option>France</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Email Address *</label>
                                <input type="email" required>
                            </div>
                            <div class="form-group">
                                <label>Phone Number *</label>
                                <input type="tel" required>
                            </div>
                        </div>

                        <!-- Professional Information -->
                        <div class="form-subsection">
                            <h4>Professional Background</h4>
                            <div class="form-group">
                                <label>Applied Position *</label>
                                <select required>
                                    <option value="">Select position</option>
                                    <option>Head Coach</option>
                                    <option>Assistant Coach</option>
                                    <option>Fitness Coach</option>
                                    <option>Goalkeeper Coach</option>
                                    <option>Youth Development Coach</option>
                                    <option>Sports Psychologist</option>
                                    <option>Physiotherapist</option>
                                    <option>Nutritionist</option>
                                    <option>House Manager</option>
                                    <option>Administrative Staff</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Years of Experience *</label>
                                    <input type="number" min="0" max="50" required>
                                </div>
                                <div class="form-group">
                                    <label>Highest Qualification</label>
                                    <select>
                                        <option>UEFA Pro License</option>
                                        <option>UEFA A License</option>
                                        <option>UEFA B License</option>
                                        <option>DFB Trainer License</option>
                                        <option>University Degree</option>
                                        <option>Professional Certificate</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Previous Experience *</label>
                                <textarea rows="4" placeholder="Describe your relevant football coaching/management experience" required></textarea>
                            </div>
                            <div class="form-group">
                                <label>Language Skills</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox"> German (Native)</label>
                                    <label><input type="checkbox"> German (Fluent)</label>
                                    <label><input type="checkbox"> English</label>
                                    <label><input type="checkbox"> Spanish</label>
                                    <label><input type="checkbox"> French</label>
                                    <label><input type="checkbox"> Other</label>
                                </div>
                            </div>
                        </div>

                        <!-- Availability -->
                        <div class="form-subsection">
                            <h4>Availability & Preferences</h4>
                            <div class="form-group">
                                <label>Available Start Date *</label>
                                <input type="date" required>
                            </div>
                            <div class="form-group">
                                <label>Contract Type Preference</label>
                                <select>
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                    <option>Volunteer</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Additional Information</label>
                                <textarea rows="3" placeholder="Any additional information about your application"></textarea>
                            </div>
                        </div>

                        <button class="btn">Submit Staff Application</button>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        let currentUser = null;

        // Login functionality
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('loginMessage');
            
            messageDiv.innerHTML = '';
            
            if (password === 'ITP2024') {
                let userData = null;
                
                if (email === 'max.bisinger@warubi-sports.com') {
                    userData = { name: 'Max Bisinger', email: email, role: 'admin' };
                } else if (email === 'thomas.ellinger@warubi-sports.com') {
                    userData = { name: 'Thomas Ellinger', email: email, role: 'staff' };
                } else {
                    messageDiv.innerHTML = '<div style="color: #dc2626; margin-top: 1rem;">Email not recognized. Please try again.</div>';
                    return;
                }
                
                currentUser = userData;
                localStorage.setItem('fc-koln-auth', JSON.stringify({
                    token: userData.role + '_' + Date.now(),
                    user: userData,
                    loginTime: new Date().toISOString()
                }));
                
                showMainApp();
                
            } else {
                messageDiv.innerHTML = '<div style="color: #dc2626; margin-top: 1rem;">Invalid password. Please try again.</div>';
            }
        });

        // Show main application
        function showMainApp() {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            document.getElementById('userName').textContent = 'Welcome, ' + currentUser.name;
        }

        // Navigation
        function showPage(pageId) {
            // Hide all pages
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            
            // Remove active from nav items
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            
            // Show selected page
            document.getElementById(pageId).classList.add('active');
            
            // Add active to clicked nav item
            event.target.classList.add('active');
        }

        // Admin tab management
        function showAdminTab(tabId) {
            // Hide all admin tabs
            const tabs = document.querySelectorAll('.admin-tab-content');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Remove active from tab buttons
            const buttons = document.querySelectorAll('.tab-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected tab
            document.getElementById(tabId + '-tab').classList.add('active');
            
            // Add active to clicked button
            event.target.classList.add('active');
        }

        // Registration type management
        function showRegistrationType(type) {
            // Hide all registration forms
            const forms = document.querySelectorAll('.registration-form');
            forms.forEach(form => form.classList.remove('active'));
            
            // Remove active from type buttons
            const buttons = document.querySelectorAll('.registration-type-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected form
            document.getElementById(type + '-registration').classList.add('active');
            
            // Add active to clicked button
            event.target.classList.add('active');
        }

        // Auth tab management for login page
        function showAuthTab(tabId) {
            // Hide all auth tabs
            const tabs = document.querySelectorAll('.auth-tab-content');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Remove active from tab buttons
            const buttons = document.querySelectorAll('.auth-tab-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected tab
            document.getElementById(tabId + '-auth-tab').classList.add('active');
            
            // Add active to clicked button
            event.target.classList.add('active');
        }

        // Public registration type management
        function showPublicRegistrationType(type) {
            // Hide all public registration forms
            const forms = document.querySelectorAll('.public-registration-form');
            forms.forEach(form => form.classList.remove('active'));
            
            // Remove active from type buttons
            const buttons = document.querySelectorAll('.public-registration-type-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected form
            document.getElementById('public-' + type + '-registration').classList.add('active');
            
            // Add active to clicked button
            event.target.classList.add('active');
        }

        // Submit player application
        function submitPlayerApplication() {
            const formData = {
                type: 'player',
                firstName: document.getElementById('playerFirstName').value,
                lastName: document.getElementById('playerLastName').value,
                email: document.getElementById('playerEmail').value,
                phone: document.getElementById('playerPhone').value,
                dateOfBirth: document.getElementById('playerBirth').value,
                nationality: document.getElementById('playerNationality').value,
                position: document.getElementById('playerPosition').value,
                previousClub: document.getElementById('playerPreviousClub').value,
                motivation: document.getElementById('playerMotivation').value,
                submittedAt: new Date().toISOString()
            };

            // Basic validation
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.motivation) {
                alert('Please fill in all required fields.');
                return;
            }

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'message success';
            successDiv.innerHTML = `
                <h3>✅ Application Submitted Successfully!</h3>
                <p>Thank you ${formData.firstName}! Your player application has been received.</p>
                <p>📧 You will receive a confirmation email at ${formData.email} within 24 hours.</p>
                <p>🏆 Our talent scouts will review your application and contact you for next steps.</p>
            `;
            
            // Replace the form with success message
            document.getElementById('public-player-registration').innerHTML = successDiv.outerHTML;
            
            console.log('Player Application Submitted:', formData);
        }

        // Submit staff application
        function submitStaffApplication() {
            const formData = {
                type: 'staff',
                firstName: document.getElementById('staffFirstName').value,
                lastName: document.getElementById('staffLastName').value,
                email: document.getElementById('staffEmail').value,
                phone: document.getElementById('staffPhone').value,
                position: document.getElementById('staffPosition').value,
                experience: document.getElementById('staffExperience').value,
                experienceDetail: document.getElementById('staffExperienceDetail').value,
                qualifications: document.getElementById('staffQualifications').value,
                submittedAt: new Date().toISOString()
            };

            // Basic validation
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.experienceDetail) {
                alert('Please fill in all required fields.');
                return;
            }

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'message success';
            successDiv.innerHTML = `
                <h3>✅ Application Submitted Successfully!</h3>
                <p>Thank you ${formData.firstName}! Your staff application has been received.</p>
                <p>📧 You will receive a confirmation email at ${formData.email} within 24 hours.</p>
                <p>📞 Our HR team will contact you to schedule an interview within 3-5 business days.</p>
            `;
            
            // Replace the form with success message
            document.getElementById('public-staff-registration').innerHTML = successDiv.outerHTML;
            
            console.log('Staff Application Submitted:', formData);
        }

        // Logout
        function logout() {
            currentUser = null;
            localStorage.removeItem('fc-koln-auth');
            document.getElementById('loginPage').style.display = 'block';
            document.getElementById('mainApp').style.display = 'none';
            
            // Reset form
            document.getElementById('email').value = 'max.bisinger@warubi-sports.com';
            document.getElementById('password').value = 'ITP2024';
            document.getElementById('loginMessage').innerHTML = '';
        }

        // Check for existing login on page load
        window.addEventListener('load', function() {
            const existingAuth = localStorage.getItem('fc-koln-auth');
            if (existingAuth) {
                try {
                    const authData = JSON.parse(existingAuth);
                    currentUser = authData.user;
                    showMainApp();
                } catch (e) {
                    console.log('Starting fresh session');
                }
            }
        });

        console.log('FC Köln Management System loaded successfully');
        console.log('Complete application with Dashboard, Players, Chores, Calendar, Food Orders, Communications, House Management, and Admin');
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // Handle health check
    if (parsedUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'healthy', 
            system: 'FC Köln Management - Complete Application',
            timestamp: new Date().toISOString()
        }));
        return;
    }
    
    // Serve complete FC Köln application
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    
    res.end(FC_KOLN_APP);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log('FC Köln Management System running on port ' + PORT);
    console.log('Admin credentials: max.bisinger@warubi-sports.com / ITP2024');
    console.log('Staff credentials: thomas.ellinger@warubi-sports.com / ITP2024');
    console.log('Features: Dashboard, Players, Chores, Calendar, Food Orders, Communications, House Management, Admin');
    console.log('Server ready at http://0.0.0.0:' + PORT);
    console.log('Complete system status: Operational');
});

// Error handling
server.on('error', (err) => {
    console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});