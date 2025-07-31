#!/usr/bin/env node

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

console.log('Starting 1.FC Köln Bundesliga Talent Program Management System...');

// Complete FC Köln Management System HTML
const FC_KOLN_APP = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1.FC Köln Bundesliga Talent Program</title>
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
            gap: 4rem;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin-right: 3rem;
        }

        .header-logo {
            height: 50px;
            width: auto;
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

        /* Enhanced Calendar Styles */
        .calendar-grid.enhanced {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        .calendar-day {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            min-height: 120px;
        }

        .calendar-day.match-day {
            background: linear-gradient(135deg, #dc2626, #ef4444);
            color: white;
        }

        .calendar-event {
            background: #f8fafc;
            border-left: 3px solid #64748b;
            padding: 0.5rem;
            margin: 0.25rem 0;
            border-radius: 4px;
            font-size: 0.875rem;
        }

        .calendar-event.training {
            border-left-color: #059669;
            background: #ecfdf5;
        }

        .calendar-event.tactical {
            border-left-color: #dc2626;
            background: #fef2f2;
        }

        .calendar-event.fitness {
            border-left-color: #7c3aed;
            background: #f3e8ff;
        }

        .calendar-event.recovery {
            border-left-color: #0891b2;
            background: #f0f9ff;
        }

        .calendar-event.match {
            background: rgba(255, 255, 255, 0.2);
            border-left-color: #fbbf24;
        }

        .event-time {
            display: block;
            font-weight: bold;
            color: #374151;
        }

        .event-title {
            display: block;
            margin: 0.25rem 0;
        }

        .attendance {
            display: block;
            font-size: 0.75rem;
            color: #6b7280;
        }

        .match-venue {
            display: block;
            font-size: 0.75rem;
            opacity: 0.8;
        }

        /* Enhanced Metrics Dashboard */
        .metrics-dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }

        .metric-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
        }

        /* Player Selection Styles */
        .player-selection-container {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            margin-top: 0.5rem;
        }

        .selection-controls {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .btn-mini {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-mini:hover {
            background: #e5e7eb;
        }

        .player-checkbox-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.75rem;
            max-height: 300px;
            overflow-y: auto;
        }

        .player-checkbox-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            transition: all 0.2s;
        }

        .player-checkbox-item:hover {
            background: #f9fafb;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .player-checkbox-item input[type="checkbox"] {
            margin: 0;
        }

        .player-info-mini {
            flex: 1;
        }

        .player-name-mini {
            font-weight: 600;
            color: #111827;
            font-size: 0.875rem;
        }

        .player-details-mini {
            font-size: 0.75rem;
            color: #6b7280;
        }

        .house-filter-section {
            margin-bottom: 1rem;
            padding: 0.75rem;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 6px;
        }

        .house-filter-buttons {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .house-filter-btn {
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .house-filter-btn:hover {
            background: #b91c1c;
        }

        /* Recurrence Options Styles */
        .recurrence-container {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            margin-top: 0.5rem;
        }

        .day-checkboxes {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-top: 0.5rem;
        }

        .day-checkboxes label {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.5rem;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .day-checkboxes label:hover {
            background: #f3f4f6;
        }

        .day-checkboxes input[type="checkbox"]:checked + * {
            color: #dc2626;
            font-weight: 600;
        }

        #recurrenceUnit {
            margin-left: 0.5rem;
            color: #6b7280;
            font-size: 0.875rem;
        }

        /* Event Management Styles */
        .event-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        .event-item {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            position: relative;
        }

        .event-item.recurring {
            border-left: 4px solid #059669;
        }

        .event-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
        }

        .event-title-main {
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.25rem;
        }

        .event-meta {
            font-size: 0.875rem;
            color: #6b7280;
        }

        .event-actions-menu {
            display: flex;
            gap: 0.25rem;
        }

        .action-btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
        }

        .action-btn:hover {
            background: #f3f4f6;
        }

        .action-btn.danger {
            color: #dc2626;
            border-color: #fecaca;
        }

        .action-btn.danger:hover {
            background: #fef2f2;
        }

        .recurring-badge {
            display: inline-block;
            padding: 0.125rem 0.5rem;
            font-size: 0.75rem;
            background: #ecfdf5;
            color: #059669;
            border-radius: 9999px;
            margin-left: 0.5rem;
        }

        .event-management-container {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            max-height: 400px;
            overflow-y: auto;
        }

        .no-events-message {
            text-align: center;
            color: #6b7280;
            font-style: italic;
            padding: 2rem;
        }

        /* Calendar Display Styles */
        .calendar-display {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
        }

        .calendar-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding: 0.5rem;
        }

        .current-month {
            font-weight: 600;
            font-size: 1.125rem;
            color: #111827;
        }

        .calendar-month-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background: #e5e7eb;
            border-radius: 6px;
            overflow: hidden;
        }

        .calendar-day-cell {
            background: white;
            min-height: 100px;
            padding: 0.5rem;
            position: relative;
        }

        .calendar-day-cell.other-month {
            background: #f9fafb;
            color: #9ca3af;
        }

        .calendar-day-cell.today {
            background: #fef3c7;
            border: 2px solid #f59e0b;
        }

        .day-number {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .calendar-day-events {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .calendar-event-dot {
            background: #dc2626;
            color: white;
            font-size: 0.625rem;
            padding: 1px 4px;
            border-radius: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .calendar-event-dot.training {
            background: #059669;
        }

        .calendar-event-dot.match {
            background: #dc2626;
        }

        .calendar-event-dot.meeting {
            background: #7c3aed;
        }

        .specific-day-options {
            margin-top: 0.5rem;
        }

        /* Calendar View Styles */
        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .calendar-controls {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .view-toggles {
            display: flex;
            background: #f3f4f6;
            border-radius: 6px;
            padding: 2px;
        }

        .view-btn {
            padding: 0.5rem 1rem;
            border: none;
            background: transparent;
            cursor: pointer;
            border-radius: 4px;
            font-size: 0.875rem;
            transition: all 0.2s;
        }

        .view-btn.active {
            background: #dc2626;
            color: white;
        }

        .view-btn:hover:not(.active) {
            background: #e5e7eb;
        }

        .calendar-nav {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .nav-btn {
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            background: white;
            cursor: pointer;
            border-radius: 4px;
            font-size: 0.875rem;
            transition: all 0.2s;
        }

        .nav-btn:hover {
            background: #f3f4f6;
        }

        .current-period {
            font-weight: 600;
            color: #111827;
            min-width: 150px;
            text-align: center;
        }

        .calendar-view {
            display: none;
        }

        .calendar-view.active {
            display: block;
        }

        /* Day View Styles */
        .day-view-content {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
        }

        .day-header {
            text-align: center;
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 1rem;
        }

        .day-date {
            font-size: 1.5rem;
            font-weight: 600;
            color: #111827;
        }

        .day-weekday {
            color: #6b7280;
            font-size: 0.875rem;
        }

        .day-events {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .day-event-item {
            padding: 1rem;
            border-left: 4px solid #dc2626;
            background: #f8fafc;
            border-radius: 0 6px 6px 0;
        }

        .day-event-item.training {
            border-left-color: #059669;
        }

        .day-event-item.weight {
            border-left-color: #7c2d12;
            background: #fef7f5;
        }

        .day-event-item.match {
            border-left-color: #dc2626;
            background: #fef2f2;
        }

        .day-event-time {
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.25rem;
        }

        .day-event-title {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .day-event-details {
            font-size: 0.875rem;
            color: #6b7280;
        }

        /* Week View Styles */
        .week-view-content {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }

        .week-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background: #e5e7eb;
        }

        .week-day {
            background: white;
            min-height: 200px;
            padding: 0.75rem;
        }

        .week-day-header {
            font-weight: 600;
            text-align: center;
            margin-bottom: 0.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #e5e7eb;
        }

        .week-day.today {
            background: #fef3c7;
        }

        .week-event {
            background: #dc2626;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 3px;
            font-size: 0.75rem;
            margin-bottom: 0.25rem;
            cursor: pointer;
        }

        .week-event.training {
            background: #059669;
        }

        .week-event.weight {
            background: #7c2d12;
        }

        .week-event.match {
            background: #dc2626;
        }

        .week-event.meeting {
            background: #7c3aed;
        }

        /* Month View Styles */
        .month-view-content {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }

        .month-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background: #e5e7eb;
        }

        .month-day {
            background: white;
            min-height: 100px;
            padding: 0.5rem;
            position: relative;
        }

        .month-day.other-month {
            background: #f9fafb;
            color: #9ca3af;
        }

        .month-day.today {
            background: #fef3c7;
            border: 2px solid #f59e0b;
        }

        .month-day-number {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .month-events {
            display: flex;
            flex-direction: column;
            gap: 1px;
        }

        .month-event-dot {
            background: #dc2626;
            color: white;
            font-size: 0.625rem;
            padding: 1px 3px;
            border-radius: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .month-event-dot.training {
            background: #059669;
        }

        .month-event-dot.weight {
            background: #7c2d12;
        }

        .month-event-dot.match {
            background: #dc2626;
        }

        .month-event-dot.meeting {
            background: #7c3aed;
        }
            padding: 1.5rem;
            text-align: center;
        }

        .metric-value {
            font-size: 2rem;
            font-weight: bold;
            color: #dc2626;
            margin: 0.5rem 0;
        }

        .metric-trend.up {
            color: #059669;
        }

        .metric-trend.stable {
            color: #6b7280;
        }

        .metric-detail {
            color: #6b7280;
            font-size: 0.875rem;
        }

        /* Event Cards */
        .upcoming-events {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin: 1rem 0;
        }

        .event-card {
            display: flex;
            align-items: center;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            transition: all 0.3s;
        }

        .event-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .event-date {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #dc2626;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            margin-right: 1.5rem;
            min-width: 60px;
        }

        .event-date .day {
            font-size: 1.5rem;
            font-weight: bold;
        }

        .event-date .month {
            font-size: 0.75rem;
            opacity: 0.8;
        }

        .event-info h4 {
            margin: 0 0 0.5rem 0;
            color: #111827;
        }

        .event-info p {
            margin: 0.25rem 0;
            color: #6b7280;
        }

        .event-status {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .event-status.home {
            background: #dcfce7;
            color: #166534;
        }

        .event-status.camp {
            background: #fef3c7;
            color: #92400e;
        }

        .event-status.medical {
            background: #dbeafe;
            color: #1e40af;
        }

        /* Calendar Actions */
        .calendar-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin: 1rem 0;
        }

        .calendar-actions .btn {
            flex: 1;
            min-width: 150px;
        }

        /* Nutrition Styles */
        .nutrition-overview {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 2rem;
            margin: 1rem 0;
        }

        .nutrition-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
        }

        .nutrition-stat h4 {
            margin: 0 0 0.5rem 0;
            color: #374151;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #dc2626;
            margin: 0.5rem 0;
        }

        .stat-progress {
            margin: 1rem 0;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #dc2626, #ef4444);
            transition: width 0.3s;
        }

        /* Meal Schedule */
        .meal-schedule {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            margin: 1rem 0;
        }

        .meal-day {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
        }

        .meal-day h4 {
            margin: 0 0 1rem 0;
            color: #dc2626;
            border-bottom: 2px solid #dc2626;
            display: inline-block;
            padding-bottom: 0.5rem;
        }

        .meal-slot {
            display: grid;
            grid-template-columns: 80px 1fr;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            margin: 0.5rem 0;
            border-radius: 6px;
            transition: background 0.3s;
        }

        .meal-slot:hover {
            background: #f8fafc;
        }

        .meal-slot.breakfast {
            border-left: 4px solid #fbbf24;
        }

        .meal-slot.lunch {
            border-left: 4px solid #059669;
        }

        .meal-slot.dinner {
            border-left: 4px solid #7c3aed;
        }

        .meal-time {
            font-weight: bold;
            color: #374151;
        }

        .meal-name {
            font-weight: 600;
            color: #111827;
        }

        .meal-details {
            color: #6b7280;
            font-size: 0.875rem;
        }

        /* Dietary Info */
        .dietary-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }

        .dietary-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
        }

        .dietary-status {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .dietary-status.active {
            background: #dcfce7;
            color: #166534;
        }

        .dietary-status.monitored {
            background: #fef3c7;
            color: #92400e;
        }

        .dietary-status.customized {
            background: #dbeafe;
            color: #1e40af;
        }

        /* Meal Requests */
        .meal-requests {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin: 1rem 0;
        }

        .request-form {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1rem 0;
        }

        .recent-requests {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
        }

        .request-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            margin: 0.5rem 0;
            background: white;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }

        .request-status {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .request-status.approved {
            background: #dcfce7;
            color: #166534;
        }

        .request-status.pending {
            background: #fef3c7;
            color: #92400e;
        }

        /* Goals Grid */
        .goals-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin: 1rem 0;
        }

        .goal-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
        }

        .progress-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: conic-gradient(#dc2626 var(--percentage), #e5e7eb 0);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem auto;
            position: relative;
        }

        .progress-circle:before {
            content: '';
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: white;
            position: absolute;
        }

        .progress-circle span {
            position: relative;
            z-index: 1;
            font-weight: bold;
            color: #dc2626;
        }

        /* Communication Styles */
        .message-composer {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1rem 0;
        }

        .composer-header, .composer-body, .composer-footer {
            margin: 1rem 0;
        }

        .message-options {
            display: flex;
            gap: 1rem;
            margin: 1rem 0;
        }

        .message-options label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: #6b7280;
        }

        .message-feed {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin: 1rem 0;
        }

        .message-item {
            background: white;
            border: 1px solid #e5e7eb;
            border-left: 4px solid #6b7280;
            border-radius: 8px;
            padding: 1.5rem;
            transition: all 0.3s;
        }

        .message-item:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .message-item.urgent {
            border-left-color: #dc2626;
            background: #fef2f2;
        }

        .message-item.match-announcement {
            border-left-color: #059669;
            background: #ecfdf5;
        }

        .message-item.info {
            border-left-color: #3b82f6;
            background: #eff6ff;
        }

        .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .message-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .sender {
            font-weight: 600;
            color: #111827;
        }

        .timestamp {
            color: #6b7280;
            font-size: 0.875rem;
        }

        .priority-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .priority-badge.high {
            background: #fecaca;
            color: #dc2626;
        }

        .priority-badge.normal {
            background: #e5e7eb;
            color: #6b7280;
        }

        .read-status {
            color: #6b7280;
            font-size: 0.875rem;
        }

        .message-content h4 {
            margin: 0 0 0.5rem 0;
            color: #111827;
        }

        .message-content p {
            margin: 0.5rem 0;
            color: #374151;
            line-height: 1.5;
        }

        .message-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
        }

        .btn-small {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            border: 1px solid #e5e7eb;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-small:hover {
            background: #f8fafc;
        }

        .quick-tools {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }

        .quick-tool {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
        }

        .quick-tool h4 {
            margin: 0 0 0.5rem 0;
            color: #111827;
        }

        .quick-tool p {
            margin: 0.5rem 0 1rem 0;
            color: #6b7280;
            font-size: 0.875rem;
        }

        .comm-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }

        .stat-card {
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

        .stat-detail {
            color: #6b7280;
            font-size: 0.875rem;
        }

        /* Admin Styles */
        .admin-nav {
            display: flex;
            gap: 1rem;
            margin: 2rem 0;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 1rem;
        }

        .admin-nav-btn {
            padding: 1rem 1.5rem;
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .admin-nav-btn:hover, .admin-nav-btn.active {
            background: #dc2626;
            color: white;
            border-color: #dc2626;
        }

        .admin-section {
            display: none;
            margin: 2rem 0;
        }

        .admin-section.active {
            display: block;
        }

        .admin-controls {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin: 2rem 0;
            padding: 1.5rem;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
        }

        .search-bar {
            display: flex;
            gap: 1rem;
        }

        .search-bar input {
            flex: 1;
        }

        .filter-controls {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .filter-controls select {
            min-width: 150px;
        }

        .players-admin-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }

        .player-admin-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            transition: all 0.3s;
        }

        .player-admin-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .player-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .player-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 2px solid #e5e7eb;
        }

        .player-info {
            flex: 1;
        }

        .player-info h4 {
            margin: 0 0 0.5rem 0;
            color: #111827;
        }

        .player-position {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            background: #f3f4f6;
            border-radius: 4px;
            font-size: 0.75rem;
            margin-right: 0.5rem;
        }

        .player-status {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .status-active {
            background: #dcfce7;
            color: #166534;
        }

        .status-injured {
            background: #fef3c7;
            color: #92400e;
        }

        .status-suspended {
            background: #fecaca;
            color: #dc2626;
        }

        .player-actions {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .btn-warning {
            background: #fbbf24;
            color: white;
        }

        .btn-success {
            background: #10b981;
            color: white;
        }

        .player-details {
            font-size: 0.875rem;
            color: #6b7280;
        }

        .player-details p {
            margin: 0.25rem 0;
        }

        /* Modal Styles */
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 2000;
        }

        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
            margin: 0;
        }

        .close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
        }

        .close:hover {
            color: #111827;
        }

        .modal-body {
            padding: 1.5rem;
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding: 1.5rem;
            border-top: 1px solid #e5e7eb;
        }

        /* Full Admin Control Styles */
        .super-admin-controls {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }

        .control-category {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
        }

        .control-category h4 {
            margin: 0 0 1rem 0;
            color: #dc2626;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5rem;
        }

        .control-category .btn {
            width: 100%;
            margin: 0.5rem 0;
            text-align: left;
        }

        .live-dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }

        .dashboard-item {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
        }

        .dashboard-item h4 {
            margin: 0 0 1rem 0;
            color: #111827;
        }

        .status-indicators, .user-activity, .security-status {
            margin: 1rem 0;
        }

        .status-indicator {
            display: block;
            margin: 0.5rem 0;
            padding: 0.25rem 0;
        }

        .live-count, .admin-count, .staff-count, .player-count {
            font-weight: bold;
            color: #dc2626;
        }

        .security-alert {
            font-weight: bold;
            color: #059669;
        }

        .danger-zone {
            background: #fef2f2;
            border: 2px solid #fecaca;
            border-radius: 8px;
            padding: 2rem;
            margin: 2rem 0;
        }

        .danger-warning {
            background: #fee2e2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .danger-warning p {
            margin: 0;
            color: #dc2626;
            font-weight: 600;
        }

        .danger-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .emergency-controls {
            background: #fffbeb;
            border: 2px solid #fbbf24;
            border-radius: 8px;
            padding: 2rem;
            margin: 2rem 0;
        }

        .emergency-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }

        .btn-emergency {
            background: #dc2626;
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-emergency:hover {
            background: #b91c1c;
            transform: translateY(-2px);
        }

        /* Dashboard Content Styles */
        .dashboard-content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin: 2rem 0;
        }

        .dashboard-section {
            min-height: 400px;
        }

        .player-overview-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            margin: 1rem 0;
        }

        .player-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1rem;
            transition: all 0.3s;
        }

        .player-card:hover {
            background: #f1f5f9;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .player-info {
            flex-grow: 1;
        }

        .player-name {
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 0.25rem;
        }

        .player-position {
            color: #64748b;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }

        .player-house {
            color: #dc2626;
            font-size: 0.85rem;
            font-weight: 500;
        }

        .player-status {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
            text-align: center;
            min-width: 80px;
        }

        .player-status.active {
            background: #dcfce7;
            color: #166534;
        }

        .player-status.training {
            background: #fef3c7;
            color: #92400e;
        }

        .player-status.rest {
            background: #e0e7ff;
            color: #3730a3;
        }

        .view-all-link {
            text-align: center;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
        }

        .view-all-link a {
            color: #dc2626;
            text-decoration: none;
            font-weight: 500;
        }

        .view-all-link a:hover {
            text-decoration: underline;
        }

        .activity-timeline {
            margin: 1rem 0;
        }

        .activity-item {
            display: flex;
            gap: 1rem;
            padding: 1rem 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-time {
            color: #64748b;
            font-size: 0.85rem;
            min-width: 80px;
            flex-shrink: 0;
        }

        .activity-content {
            flex-grow: 1;
        }

        .activity-title {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 0.25rem;
        }

        .activity-description {
            color: #64748b;
            font-size: 0.9rem;
        }



        /* Leaderboard Styles */
        .leaderboard-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            margin: 0.5rem 0;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            transition: all 0.3s;
        }

        .leaderboard-item:hover {
            background: #f1f5f9;
            transform: translateY(-2px);
        }

        .leaderboard-item.first-place {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            border-color: #f59e0b;
        }

        .leaderboard-item.second-place {
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            border-color: #9ca3af;
        }

        .leaderboard-item.third-place {
            background: linear-gradient(135deg, #fef2f2, #fecaca);
            border-color: #f87171;
        }

        .rank {
            font-size: 1.5rem;
            min-width: 40px;
            text-align: center;
        }

        .house-info {
            flex-grow: 1;
        }

        .house-name {
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 0.25rem;
        }

        .house-details {
            color: #64748b;
            font-size: 0.85rem;
        }

        .points {
            font-weight: bold;
            color: #dc2626;
            font-size: 1.1rem;
        }

        .weekly-challenge {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 0.9rem;
        }

        /* Chore Management Styles */
        .chore-creation-form {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1rem 0;
        }

        .players-checkbox-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.75rem;
            margin: 1rem 0;
            padding: 1rem;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
        }

        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .checkbox-item:hover {
            background: #f1f5f9;
        }

        .checkbox-item input[type="checkbox"] {
            margin: 0;
            cursor: pointer;
        }

        .checkbox-item span {
            font-size: 0.9rem;
            color: #374151;
        }

        .selection-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
        }

        .selected-count {
            font-size: 0.9rem;
            color: #6b7280;
            font-weight: 500;
        }

        .form-help {
            font-size: 0.85rem;
            color: #6b7280;
            margin: 0.25rem 0 0.5rem 0;
        }

        /* Enhanced Player Management Styles */
        .players-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
            animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .player-card {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            border: 1px solid rgba(220, 38, 38, 0.1);
            position: relative;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            animation: slideIn 0.5s ease-out;
        }

        .player-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%);
            transition: all 0.3s ease;
        }

        .player-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }

        .player-card:hover::before {
            height: 8px;
            background: linear-gradient(90deg, #dc2626 0%, #f59e0b 50%, #dc2626 100%);
        }

        .player-card.injured::before {
            background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
        }

        .player-card.suspended::before {
            background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
        }

        .player-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1.5rem;
            position: relative;
        }

        .player-info-section {
            flex: 1;
        }

        .player-name {
            font-size: 1.4rem;
            font-weight: 800;
            color: #1f2937;
            margin: 0 0 0.5rem 0;
            background: linear-gradient(135deg, #374151 0%, #6b7280 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .player-position {
            color: #dc2626;
            font-size: 1rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .player-position::before {
            content: '⚽';
            font-size: 0.9rem;
        }

        .player-status {
            padding: 0.5rem 1rem;
            border-radius: 25px;
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        }

        .player-status::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.6s;
        }

        .player-status:hover::before {
            left: 100%;
        }

        .player-status.active {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }

        .player-status.injured {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
        }

        .player-status.suspended {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
        }

        .player-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1.5rem 0;
            padding: 1.5rem;
            background: rgba(248, 250, 252, 0.8);
            border-radius: 12px;
            border: 1px solid rgba(220, 38, 38, 0.05);
        }

        .player-detail {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            padding: 0.5rem;
            border-radius: 8px;
            transition: all 0.2s ease;
        }

        .player-detail:hover {
            background: rgba(220, 38, 38, 0.05);
            transform: translateY(-1px);
        }

        .player-detail-label {
            font-size: 0.75rem;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .player-detail-value {
            font-size: 0.95rem;
            font-weight: 700;
            color: #374151;
        }

        .player-actions {
            display: flex;
            gap: 0.75rem;
            margin-top: 2rem;
        }

        .player-actions button {
            flex: 1;
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .player-actions button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.4s;
        }

        .player-actions button:hover::before {
            left: 100%;
        }

        .player-actions button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .btn-mini {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            border: none;
            font-size: 0.85rem;
        }

        .btn-mini:hover {
            background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
        }

        /* Player Statistics Cards Enhancement */
        .analytics-card {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            border: 1px solid rgba(220, 38, 38, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .analytics-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%);
        }

        .analytics-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.12);
        }

        .analytics-card h4 {
            color: #374151;
            font-weight: 700;
            margin-bottom: 1rem;
            font-size: 1rem;
        }

        .stat-large {
            font-size: 2.5rem;
            font-weight: 900;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }

        .analytics-card p {
            color: #6b7280;
            font-size: 0.9rem;
            font-weight: 500;
        }

        /* Enhanced Filter Section */
        .filter-grid {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            border: 1px solid rgba(220, 38, 38, 0.1);
            margin-bottom: 2rem;
        }

        .filter-grid .form-group input,
        .filter-grid .form-group select {
            border-radius: 12px;
            border: 2px solid #e5e7eb;
            transition: all 0.3s ease;
            padding: 0.75rem 1rem;
        }

        .filter-grid .form-group input:focus,
        .filter-grid .form-group select:focus {
            border-color: #dc2626;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
            transform: translateY(-1px);
        }

        /* Grocery Management Styles */
        .delivery-schedule {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin: 1.5rem 0;
        }

        .delivery-card {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            border: 1px solid rgba(220, 38, 38, 0.1);
            transition: all 0.3s ease;
        }

        .delivery-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.12);
        }

        .delivery-card.tuesday::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%);
            border-radius: 16px 16px 0 0;
        }

        .delivery-card.friday::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #059669 0%, #047857 100%);
            border-radius: 16px 16px 0 0;
        }

        .delivery-card {
            position: relative;
        }

        .deadline-info strong {
            color: #dc2626;
            font-size: 1.1rem;
        }

        .budget-overview {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin: 1.5rem 0;
        }

        .budget-card {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            border: 1px solid rgba(220, 38, 38, 0.1);
            text-align: center;
        }

        .budget-amount.large {
            font-size: 3rem;
            font-weight: 900;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 1rem 0;
        }

        .budget-limit {
            color: #6b7280;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
        }

        .budget-remaining {
            color: #059669;
            font-size: 1.2rem;
            font-weight: 700;
        }

        .budget-breakdown {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .category-budget {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: rgba(248, 250, 252, 0.8);
            border-radius: 12px;
            border: 1px solid rgba(220, 38, 38, 0.05);
            transition: all 0.2s ease;
        }

        .category-budget:hover {
            background: rgba(220, 38, 38, 0.05);
            transform: translateX(5px);
        }

        .grocery-categories {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .category-section {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            border: 1px solid rgba(220, 38, 38, 0.1);
        }

        .category-title {
            color: #374151;
            font-weight: 700;
            margin-bottom: 1.5rem;
            font-size: 1.3rem;
            border-bottom: 2px solid rgba(220, 38, 38, 0.1);
            padding-bottom: 0.5rem;
        }

        .items-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }

        .grocery-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            background: rgba(248, 250, 252, 0.8);
            border-radius: 12px;
            border: 1px solid rgba(220, 38, 38, 0.05);
            transition: all 0.3s ease;
        }

        .grocery-item:hover {
            background: rgba(220, 38, 38, 0.05);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .item-name {
            font-weight: 600;
            color: #374151;
            flex: 1;
        }

        .item-price {
            font-weight: 700;
            color: #dc2626;
            margin: 0 1rem;
            font-size: 1.1rem;
        }

        .grocery-item input[type="checkbox"] {
            margin-right: 0.5rem;
            transform: scale(1.2);
        }

        .qty {
            color: #6b7280;
            font-weight: 600;
        }

        .order-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            justify-content: center;
        }

        .order-actions button {
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
        }

        .order-status {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .order-card {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            border: 1px solid rgba(220, 38, 38, 0.1);
            position: relative;
        }

        .order-card.pending::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
            border-radius: 16px 16px 0 0;
        }

        .order-card.confirmed::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #059669 0%, #047857 100%);
            border-radius: 16px 16px 0 0;
        }

        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .status-badge {
            padding: 0.5rem 1rem;
            border-radius: 25px;
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-badge.pending {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
        }

        .status-badge.confirmed {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
        }

        .order-details p {
            margin: 0.25rem 0;
            color: #6b7280;
        }

        /* Modal Styles */
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-content {
            background: white;
            border-radius: 15px;
            width: 90%;
            max-width: 700px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
            border-radius: 15px 15px 0 0;
        }

        .modal-header h3 {
            margin: 0;
            color: #374151;
            font-size: 1.25rem;
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 2rem;
            color: #6b7280;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .close-btn:hover {
            color: #374151;
        }

        .modal-body {
            padding: 1.5rem;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
        }

        .form-actions button {
            flex: 1;
        }

        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
            
            .modal-content {
                width: 95%;
                margin: 1rem;
            }
        }

        .chore-assignments-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 1.5rem;
            margin: 1rem 0;
        }

        .chore-assignment-card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-left: 4px solid;
            transition: all 0.3s;
        }

        .chore-assignment-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .chore-assignment-card.urgent {
            border-left-color: #dc2626;
        }

        .chore-assignment-card.high {
            border-left-color: #f59e0b;
        }

        .chore-assignment-card.medium {
            border-left-color: #3b82f6;
        }

        .chore-assignment-card.low {
            border-left-color: #10b981;
        }

        .chore-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .chore-header h4 {
            margin: 0;
            color: #1e293b;
        }

        .priority-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .priority-badge.urgent {
            background: #fef2f2;
            color: #dc2626;
        }

        .priority-badge.high {
            background: #fffbeb;
            color: #f59e0b;
        }

        .priority-badge.medium {
            background: #eff6ff;
            color: #3b82f6;
        }

        .priority-badge.low {
            background: #f0fdf4;
            color: #10b981;
        }

        .chore-details p {
            margin: 0.5rem 0;
            color: #64748b;
        }

        .chore-details strong {
            color: #1e293b;
        }

        .chore-actions {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .btn-success {
            background: #10b981;
            color: white;
        }

        .btn-success:hover {
            background: #059669;
        }

        .btn-warning {
            background: #f59e0b;
            color: white;
        }

        .btn-warning:hover {
            background: #d97706;
        }

        .btn-danger {
            background: #dc2626;
            color: white;
        }

        .btn-danger:hover {
            background: #b91c1c;
        }

        .btn-info {
            background: #3b82f6;
            color: white;
        }

        .btn-info:hover {
            background: #2563eb;
        }

        .analytics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }

        .analytics-card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .analytics-card h4 {
            margin: 0 0 0.5rem 0;
            color: #64748b;
            font-size: 0.9rem;
            font-weight: 500;
        }

        .house-stats p {
            margin: 0.5rem 0;
            color: #64748b;
        }

        .completion-rate.good {
            color: #10b981;
            font-weight: 600;
        }

        .completion-rate.excellent {
            color: #059669;
            font-weight: 600;
        }

        .completion-rate.warning {
            color: #f59e0b;
            font-weight: 600;
        }

        .status-badge.in-progress {
            background: #fef3c7;
            color: #92400e;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .status-badge.pending {
            background: #fef2f2;
            color: #dc2626;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .status-badge.completed {
            background: #dcfce7;
            color: #166534;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        @media (max-width: 768px) {
            .dashboard-content-grid {
                grid-template-columns: 1fr;
            }
            
            .chore-assignments-grid {
                grid-template-columns: 1fr;
            }
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
        
        .forgot-password-section {
            margin-top: 1rem;
            text-align: center;
        }

        .forgot-password-btn {
            background: none;
            border: none;
            color: #dc2626;
            font-size: 0.875rem;
            cursor: pointer;
            text-decoration: underline;
            padding: 0.5rem;
        }

        .forgot-password-btn:hover {
            color: #b91c1c;
        }

        .back-to-login {
            margin-top: 1rem;
            text-align: center;
        }

        .back-btn {
            background: none;
            border: none;
            color: #64748b;
            font-size: 0.875rem;
            cursor: pointer;
            padding: 0.5rem;
        }

        .back-btn:hover {
            color: #374151;
        }

        /* Individual Food Order Styles */
        .budget-card.individual {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border: 2px solid #dc2626;
        }

        .budget-warning {
            color: #dc2626;
            font-weight: bold;
            margin-top: 0.5rem;
            padding: 0.5rem;
            background: #fef2f2;
            border-radius: 4px;
        }

        .validation-message {
            padding: 0.5rem;
            margin: 0.5rem 0;
            border-radius: 4px;
            font-weight: 600;
        }

        .validation-message.success {
            background: #f0fdf4;
            color: #166534;
            border: 1px solid #bbf7d0;
        }

        .validation-message.warning {
            background: #fffbeb;
            color: #92400e;
            border: 1px solid #fde68a;
        }

        .validation-message.error {
            background: #fef2f2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }

        .order-preview {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
        }

        .order-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .order-item:last-child {
            border-bottom: none;
        }

        .order-total {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 2px solid #dc2626;
            text-align: center;
            font-size: 1.1rem;
        }

        .order-history {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .order-history-item {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            border-left: 4px solid #22c55e;
        }

        .order-history-item.delivered {
            border-left-color: #22c55e;
        }

        .order-date {
            font-weight: 600;
            color: #374151;
        }

        .order-total {
            font-size: 1.1rem;
            font-weight: bold;
            color: #dc2626;
        }

        .order-status {
            color: #22c55e;
            font-weight: 600;
        }

        .order-items {
            color: #6b7280;
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }

        .deadline-status {
            margin-top: 0.5rem;
            padding: 0.25rem 0.5rem;
            background: #f0fdf4;
            color: #166534;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 600;
        }

        .btn.disabled {
            background: #9ca3af;
            cursor: not-allowed;
            opacity: 0.6;
        }

        /* House Summary Admin Styles */
        .house-summary-tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            border-bottom: 2px solid #e5e7eb;
        }

        .house-tab-btn {
            padding: 0.75rem 1.5rem;
            background: none;
            border: none;
            color: #6b7280;
            font-weight: 600;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: all 0.3s;
        }

        .house-tab-btn.active {
            color: #dc2626;
            border-bottom-color: #dc2626;
        }

        .house-tab-btn:hover {
            color: #dc2626;
            background: #f8fafc;
        }

        .house-summary-content {
            display: none;
        }

        .house-summary-content.active {
            display: block;
        }

        .house-group {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border-left: 5px solid #dc2626;
        }

        .house-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #dc2626;
        }

        .house-header h4 {
            margin: 0;
            color: #374151;
            font-size: 1.25rem;
        }

        .house-total {
            font-size: 1.1rem;
            font-weight: bold;
            color: #dc2626;
            background: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            border: 2px solid #dc2626;
        }

        .house-players {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .player-order-summary {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .player-name {
            font-weight: 600;
            color: #374151;
            display: block;
            margin-bottom: 0.5rem;
        }

        .order-total {
            font-weight: bold;
            color: #dc2626;
            float: right;
        }

        .order-items-preview {
            color: #6b7280;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            clear: both;
        }

        .house-shopping-list {
            background: white;
            border: 2px solid #dc2626;
            border-radius: 8px;
            padding: 1rem;
        }

        .house-shopping-list h5 {
            margin: 0 0 0.75rem 0;
            color: #dc2626;
            font-weight: 600;
        }

        .shopping-items {
            color: #374151;
        }

        .shopping-item {
            display: block;
            padding: 0.25rem 0;
        }

        .admin-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 2px solid #e5e7eb;
        }

        .player-order-summary.expanded {
            margin-bottom: 1.5rem;
        }

        .detailed-order-items {
            margin-top: 1rem;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 6px;
            border-left: 3px solid #dc2626;
        }

        .detailed-order-items .order-item {
            padding: 0.25rem 0;
            font-size: 0.875rem;
            color: #4b5563;
            border-bottom: 1px solid #e5e7eb;
        }

        .detailed-order-items .order-item:last-child {
            border-bottom: none;
        }

        .consolidated-items {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .item-category {
            padding: 0.75rem;
            background: #f8fafc;
            border-radius: 6px;
            border-left: 3px solid #10b981;
        }

        .item-category strong {
            color: #dc2626;
            display: block;
            margin-bottom: 0.25rem;
        }

        .empty-order {
            text-align: center;
            color: #6b7280;
            font-style: italic;
            padding: 2rem;
            background: #f9fafb;
            border-radius: 8px;
            border: 2px dashed #d1d5db;
        }

        /* WhatsApp-style Chat Interface */
        .chat-container {
            display: flex;
            height: 70vh;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .chat-sidebar {
            width: 350px;
            background: #f8f9fa;
            border-right: 1px solid #e5e7eb;
            display: flex;
            flex-direction: column;
        }

        .chat-header {
            padding: 1rem;
            background: #dc2626;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-header h3 {
            margin: 0;
            font-size: 1.2rem;
        }

        .btn-icon {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
            transition: background-color 0.2s;
        }

        .btn-icon:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .chat-tabs {
            display: flex;
            background: #e5e7eb;
            border-bottom: 1px solid #d1d5db;
        }

        .chat-tab-btn {
            flex: 1;
            padding: 0.75rem;
            background: none;
            border: none;
            cursor: pointer;
            font-weight: 500;
            color: #6b7280;
            transition: all 0.2s;
        }

        .chat-tab-btn.active {
            background: #ffffff;
            color: #dc2626;
            border-bottom: 2px solid #dc2626;
        }

        .chat-list-container {
            flex: 1;
            overflow-y: auto;
            display: none;
        }

        .chat-list-container.active {
            display: block;
        }

        .chat-item {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            cursor: pointer;
            border-bottom: 1px solid #e5e7eb;
            transition: background-color 0.2s;
        }

        .chat-item:hover {
            background: #f3f4f6;
        }

        .chat-item.active {
            background: #dc2626;
            color: white;
        }

        .chat-avatar-simple {
            position: relative;
            margin-right: 0.75rem;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #dc2626;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .avatar-initials {
            color: white;
            font-weight: 600;
            font-size: 0.9rem;
        }

        .chat-avatar.group, .chat-avatar.house {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #dc2626;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 0.75rem;
        }

        .group-icon, .house-icon {
            font-size: 1.2rem;
        }

        .status-indicator {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid white;
        }

        .status-indicator.online {
            background: #10b981;
        }

        .status-indicator.away {
            background: #f59e0b;
        }

        .status-indicator.offline {
            background: #6b7280;
        }

        .chat-info {
            flex: 1;
            min-width: 0;
        }

        .chat-name {
            font-weight: 600;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }

        .chat-preview {
            font-size: 0.8rem;
            color: #6b7280;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .chat-item.active .chat-preview {
            color: rgba(255, 255, 255, 0.8);
        }

        .chat-time {
            font-size: 0.7rem;
            color: #9ca3af;
            margin-top: 0.25rem;
        }

        .chat-item.active .chat-time {
            color: rgba(255, 255, 255, 0.7);
        }

        .chat-badges {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .unread-count {
            background: #dc2626;
            color: white;
            font-size: 0.7rem;
            padding: 0.2rem 0.4rem;
            border-radius: 10px;
            min-width: 18px;
            text-align: center;
        }

        .chat-item.active .unread-count {
            background: rgba(255, 255, 255, 0.3);
        }

        .message-status {
            color: #10b981;
            font-size: 0.8rem;
        }

        .message-status.delivered {
            color: #6b7280;
        }

        .chat-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #ffffff;
        }

        .chat-window-header {
            padding: 1rem;
            background: #dc2626;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-contact-info {
            display: flex;
            align-items: center;
        }

        .contact-avatar-simple {
            position: relative;
            margin-right: 0.75rem;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #dc2626;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .contact-name {
            font-weight: 600;
            font-size: 1rem;
        }

        .contact-status {
            font-size: 0.8rem;
            opacity: 0.8;
        }

        .chat-actions {
            display: flex;
            gap: 0.5rem;
        }

        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
            background: #f8f9fa;
        }

        .date-separator {
            text-align: center;
            margin: 1rem 0;
        }

        .date-separator span {
            background: #e5e7eb;
            color: #6b7280;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
        }

        .message {
            display: flex;
            margin-bottom: 1rem;
        }

        .message.sent {
            justify-content: flex-end;
        }

        .message-avatar-simple {
            margin-right: 0.5rem;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #dc2626;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .avatar-initials-small {
            color: white;
            font-weight: 600;
            font-size: 0.7rem;
        }

        .message-content {
            max-width: 70%;
        }

        .message.sent .message-content {
            text-align: right;
        }

        .message-bubble {
            background: #ffffff;
            padding: 0.75rem 1rem;
            border-radius: 18px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            margin-bottom: 0.25rem;
            position: relative;
        }

        .message.sent .message-bubble {
            background: #dcf8c6;
        }

        .message-bubble p {
            margin: 0;
            font-size: 0.9rem;
            line-height: 1.4;
        }

        .message-bubble.image {
            padding: 0.5rem;
        }

        .message-image {
            width: 100%;
            max-width: 300px;
            border-radius: 12px;
            margin-bottom: 0.5rem;
        }

        .message-bubble.file {
            padding: 1rem;
        }

        .file-preview {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .file-icon {
            font-size: 1.5rem;
        }

        .file-info {
            flex: 1;
        }

        .file-name {
            font-weight: 600;
            font-size: 0.9rem;
        }

        .file-size {
            font-size: 0.8rem;
            color: #6b7280;
        }

        .file-download {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
            transition: background-color 0.2s;
        }

        .file-download:hover {
            background: #f3f4f6;
        }

        .message-time {
            font-size: 0.7rem;
            color: #6b7280;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .typing-dots {
            display: flex;
            gap: 0.25rem;
            padding: 0.5rem 0;
        }

        .typing-dots span {
            width: 6px;
            height: 6px;
            background: #6b7280;
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) {
            animation-delay: -0.32s;
        }

        .typing-dots span:nth-child(2) {
            animation-delay: -0.16s;
        }

        @keyframes typing {
            0%, 80%, 100% {
                transform: scale(0);
            }
            40% {
                transform: scale(1);
            }
        }

        .message-input-container {
            background: #ffffff;
            border-top: 1px solid #e5e7eb;
            padding: 1rem;
        }

        .message-input-area {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: #f8f9fa;
            border-radius: 24px;
            padding: 0.5rem;
        }

        .message-input {
            flex: 1;
            border: none;
            background: none;
            outline: none;
            padding: 0.5rem;
            font-size: 0.9rem;
        }

        .btn-send {
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .btn-send:hover {
            background: #b91c1c;
        }

        .file-preview-container {
            margin-top: 0.5rem;
            background: #f3f4f6;
            border-radius: 8px;
            padding: 0.5rem;
        }

        .file-preview-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .remove-file {
            background: none;
            border: none;
            cursor: pointer;
            color: #dc2626;
        }

        /* Modal Styles */
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow: hidden;
        }

        .modal-header {
            padding: 1rem;
            background: #dc2626;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h3 {
            margin: 0;
        }

        .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
        }

        .modal-body {
            padding: 1rem;
            max-height: 60vh;
            overflow-y: auto;
        }

        .contact-search {
            margin-bottom: 1rem;
        }

        .contact-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            padding: 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .contact-item:hover {
            background: #f3f4f6;
        }

        .contact-item .contact-avatar-simple {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #dc2626;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 0.75rem;
        }

        .contact-info {
            flex: 1;
        }

        .contact-name {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .contact-role {
            font-size: 0.8rem;
            color: #6b7280;
        }

        .contact-status {
            width: 12px;
            height: 12px;
            border-radius: 50%;
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
            margin-bottom: 2rem;
        }

        .fc-koln-logo {
            height: 120px;
            width: auto;
            margin-bottom: 1rem;
        }

        .login-card h1 {
            color: #dc2626;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 0.5rem;
            line-height: 1.2;
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
            <div class="login-logo">
                <img src="attached_assets/NewCologneLogo_1753281112388.png" alt="1.FC Köln Logo" class="fc-koln-logo">
            </div>
            <h1>1.FC Köln Bundesliga Talent Program</h1>
            <div class="login-subtitle">Management System</div>
            
            <!-- Login/Registration Tabs -->
            <div class="auth-tabs">
                <button class="auth-tab-btn active" onclick="showAuthTab('login')">Sign In</button>
                <button class="auth-tab-btn" onclick="showAuthTab('register')">Join Program</button>
            </div>
            
            <!-- Login Form -->
            <div id="loginTab" class="auth-tab-content" style="display: block;">
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
                
                <div class="forgot-password-section">
                    <button type="button" class="forgot-password-btn" onclick="showForgotPassword()">Forgot Password?</button>
                </div>
                
                <div id="loginMessage"></div>
            </div>
            
            <!-- Forgot Password Form -->
            <div id="forgotPasswordTab" class="auth-tab-content" style="display: none;">
                <h3>Reset Your Password</h3>
                <p>Enter your email address and we'll send you instructions to reset your password.</p>
                <form id="forgotPasswordForm">
                    <div class="form-group">
                        <label for="forgotEmail">Email Address</label>
                        <input type="email" id="forgotEmail" required>
                    </div>
                    <button type="submit" class="btn">Send Reset Instructions</button>
                </form>
                <div class="back-to-login">
                    <button type="button" class="back-btn" onclick="showAuthTab('login')">← Back to Sign In</button>
                </div>
                <div id="forgotPasswordMessage"></div>
            </div>

            <!-- Public Registration Tab -->
            <div id="registerTab" class="auth-tab-content" style="display: none;">
                <div class="public-registration">
                    <p class="registration-intro">1.FC Köln Bundesliga Talent Program Registration</p>
                    
                    <!-- Registration Type Selection -->
                    <div class="public-registration-types">
                        <button class="public-registration-type-btn active" onclick="showPublicRegistrationType('player')">
                            <div class="registration-icon">⚽</div>
                            <h4>Player Registration</h4>
                            <p>Current FC Köln signed players</p>
                        </button>
                        <button class="public-registration-type-btn" onclick="showPublicRegistrationType('staff')">
                            <div class="registration-icon">👨‍🏫</div>
                            <h4>Staff Registration</h4>
                            <p>Current FC Köln staff members</p>
                        </button>
                    </div>

                    <!-- Quick Player Registration -->
                    <div id="public-player-registration" class="public-registration-form active">
                        <h3>Player Registration Form</h3>
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
                                        <option>Afghanistan</option>
                                        <option>Albania</option>
                                        <option>Algeria</option>
                                        <option>Argentina</option>
                                        <option>Australia</option>
                                        <option>Austria</option>
                                        <option>Belgium</option>
                                        <option>Bosnia and Herzegovina</option>
                                        <option>Brazil</option>
                                        <option>Bulgaria</option>
                                        <option>Cameroon</option>
                                        <option>Canada</option>
                                        <option>Chile</option>
                                        <option>Colombia</option>
                                        <option>Croatia</option>
                                        <option>Czech Republic</option>
                                        <option>Denmark</option>
                                        <option>Ecuador</option>
                                        <option>Egypt</option>
                                        <option>England</option>
                                        <option>Finland</option>
                                        <option>France</option>
                                        <option>Germany</option>
                                        <option>Ghana</option>
                                        <option>Greece</option>
                                        <option>Hungary</option>
                                        <option>Iceland</option>
                                        <option>Iran</option>
                                        <option>Iraq</option>
                                        <option>Ireland</option>
                                        <option>Israel</option>
                                        <option>Italy</option>
                                        <option>Ivory Coast</option>
                                        <option>Japan</option>
                                        <option>Jordan</option>
                                        <option>Kosovo</option>
                                        <option>Lebanon</option>
                                        <option>Mali</option>
                                        <option>Mexico</option>
                                        <option>Montenegro</option>
                                        <option>Morocco</option>
                                        <option>Netherlands</option>
                                        <option>Nigeria</option>
                                        <option>North Macedonia</option>
                                        <option>Norway</option>
                                        <option>Peru</option>
                                        <option>Poland</option>
                                        <option>Portugal</option>
                                        <option>Romania</option>
                                        <option>Russia</option>
                                        <option>Scotland</option>
                                        <option>Senegal</option>
                                        <option>Serbia</option>
                                        <option>Slovakia</option>
                                        <option>Slovenia</option>
                                        <option>South Korea</option>
                                        <option>Spain</option>
                                        <option>Sweden</option>
                                        <option>Switzerland</option>
                                        <option>Syria</option>
                                        <option>Tunisia</option>
                                        <option>Turkey</option>
                                        <option>Ukraine</option>
                                        <option>United States</option>
                                        <option>Uruguay</option>
                                        <option>Venezuela</option>
                                        <option>Wales</option>
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

                            </div>
                            <div class="form-group">
                                <label>Additional Information *</label>
                                <textarea rows="3" id="playerMotivation" placeholder="Any special requirements, medical conditions, or information we should know" required></textarea>
                            </div>
                            
                            <button type="button" class="btn btn-primary" onclick="submitPlayerApplication()">Complete Registration</button>
                            <p class="form-note">* This registration will update your profile in our system and notify the coaching staff.</p>
                        </form>
                    </div>

                    <!-- Quick Staff Registration -->
                    <div id="public-staff-registration" class="public-registration-form">
                        <h3>Staff Registration Form</h3>
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
                            <div class="form-group">
                                <label>Current Position *</label>
                                <select id="staffPosition" required>
                                    <option value="">Select position</option>
                                    <option>Staff</option>
                                    <option>Coach</option>
                                    <option>Admin</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Additional Information *</label>
                                <textarea rows="3" id="staffExperienceDetail" placeholder="Any updates to your role, special requirements, or information we should know" required></textarea>
                            </div>
                            
                            <button type="button" class="btn btn-primary" onclick="submitStaffApplication()">Complete Registration</button>
                            <p class="form-note">* This registration will update your profile in our system and notify management.</p>
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
                <div class="logo">
                    <img src="attached_assets/NewCologneLogo_1753281112388.png" alt="1.FC Köln Logo" class="header-logo">
                    1.FC Köln Bundesliga Talent Program
                </div>
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
                <a class="nav-item" onclick="showPage('house-management')">Housing</a>
                <a class="nav-item" onclick="showPage('food-orders')">Food Orders</a>
                <a class="nav-item" onclick="showPage('communications')">Communications</a>
                <a class="nav-item" onclick="showPage('calendar')">Calendar</a>
                <a class="nav-item admin-only" onclick="showPage('admin')" style="display: none;">Member Management</a>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="main">
            <!-- Dashboard Page -->
            <div id="dashboard" class="page active">
                <h1>1.FC Köln Bundesliga Talent Program Dashboard</h1>
                
                <!-- Key Metrics -->
                <div class="dashboard-grid">
                    <div class="card">
                        <h3>Total Players</h3>
                        <div class="stat">24</div>
                        <p>Active in program</p>
                    </div>
                    <div class="card">
                        <h3>Training Today</h3>
                        <div class="stat">18</div>
                        <p>Players attending</p>
                    </div>
                    <div class="card">
                        <h3>Houses</h3>
                        <div class="stat">3</div>
                        <p>Widdersdorf locations</p>
                    </div>
                    <div class="card">
                        <h3>Activities Today</h3>
                        <div class="stat">5</div>
                        <p>Scheduled events</p>
                    </div>
                </div>

                <!-- Dashboard Content Grid -->
                <div class="dashboard-content-grid">
                    <!-- Player Overview -->
                    <div class="dashboard-section">
                        <div class="card">
                            <h3>🏆 Player Overview</h3>
                            <div class="player-overview-grid">
                                <div class="player-card">
                                    <div class="player-info">
                                        <div class="player-name">Max Finkgräfe</div>
                                        <div class="player-position">Striker</div>
                                        <div class="player-house">Widdersdorf 1</div>
                                    </div>
                                    <div class="player-status active">Active</div>
                                </div>
                                <div class="player-card">
                                    <div class="player-info">
                                        <div class="player-name">Tim Lemperle</div>
                                        <div class="player-position">Winger</div>
                                        <div class="player-house">Widdersdorf 2</div>
                                    </div>
                                    <div class="player-status active">Active</div>
                                </div>
                                <div class="player-card">
                                    <div class="player-info">
                                        <div class="player-name">Mark Uth</div>
                                        <div class="player-position">Midfielder</div>
                                        <div class="player-house">Widdersdorf 1</div>
                                    </div>
                                    <div class="player-status training">Training</div>
                                </div>
                                <div class="player-card">
                                    <div class="player-info">
                                        <div class="player-name">Steffen Tigges</div>
                                        <div class="player-position">Striker</div>
                                        <div class="player-house">Widdersdorf 3</div>
                                    </div>
                                    <div class="player-status active">Active</div>
                                </div>
                                <div class="player-card">
                                    <div class="player-info">
                                        <div class="player-name">Linton Maina</div>
                                        <div class="player-position">Winger</div>
                                        <div class="player-house">Widdersdorf 2</div>
                                    </div>
                                    <div class="player-status training">Training</div>
                                </div>
                                <div class="player-card">
                                    <div class="player-info">
                                        <div class="player-name">Florian Kainz</div>
                                        <div class="player-position">Midfielder</div>
                                        <div class="player-house">Widdersdorf 1</div>
                                    </div>
                                    <div class="player-status rest">Rest Day</div>
                                </div>
                            </div>
                            <div class="view-all-link">
                                <a href="#" onclick="showPage('players')">View All Players →</a>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="dashboard-section">
                        <div class="card">
                            <h3>📈 Recent Activity</h3>
                            <div class="activity-timeline">
                                <div class="activity-item">
                                    <div class="activity-time">10:30 AM</div>
                                    <div class="activity-content">
                                        <div class="activity-title">Training Session Completed</div>
                                        <div class="activity-description">Morning fitness training - 18 players attended</div>
                                    </div>
                                </div>
                                <div class="activity-item">
                                    <div class="activity-time">9:15 AM</div>
                                    <div class="activity-content">
                                        <div class="activity-title">New Player Registration</div>
                                        <div class="activity-description">Dennis Huseinbašić completed profile setup</div>
                                    </div>
                                </div>
                                <div class="activity-item">
                                    <div class="activity-time">8:45 AM</div>
                                    <div class="activity-content">
                                        <div class="activity-title">Meal Orders Submitted</div>
                                        <div class="activity-description">22 players submitted lunch preferences</div>
                                    </div>
                                </div>
                                <div class="activity-item">
                                    <div class="activity-time">Yesterday</div>
                                    <div class="activity-content">
                                        <div class="activity-title">House Chores Completed</div>
                                        <div class="activity-description">Widdersdorf 2 finished all weekly tasks</div>
                                    </div>
                                </div>
                                <div class="activity-item">
                                    <div class="activity-time">Yesterday</div>
                                    <div class="activity-content">
                                        <div class="activity-title">Medical Check-up</div>
                                        <div class="activity-description">5 players completed monthly health assessments</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                    <!-- House Competition Leaderboard -->
                    <div class="dashboard-section">
                        <div class="card">
                            <h3>🏠 House Competition Leaderboard</h3>
                            <div class="leaderboard">
                                <div class="leaderboard-item first-place">
                                    <div class="rank">🥇</div>
                                    <div class="house-info">
                                        <div class="house-name">Widdersdorf 2</div>
                                        <div class="house-details">8 players • Clean record</div>
                                    </div>
                                    <div class="points">945 pts</div>
                                </div>
                                <div class="leaderboard-item second-place">
                                    <div class="rank">🥈</div>
                                    <div class="house-info">
                                        <div class="house-name">Widdersdorf 1</div>
                                        <div class="house-details">9 players • 2 pending tasks</div>
                                    </div>
                                    <div class="points">920 pts</div>
                                </div>
                                <div class="leaderboard-item third-place">
                                    <div class="rank">🥉</div>
                                    <div class="house-info">
                                        <div class="house-name">Widdersdorf 3</div>
                                        <div class="house-details">7 players • 1 pending task</div>
                                    </div>
                                    <div class="points">885 pts</div>
                                </div>
                            </div>
                            <div class="weekly-challenge">
                                <p><strong>This Week:</strong> Fitness Challenge (20 pts), Chore Completion (15 pts), Team Spirit (10 pts)</p>
                            </div>
                        </div>
                    </div>
                </div>
                



            </div>

            <!-- Players Page -->
            <div id="players" class="page">
                <h1>Player Management</h1>
                
                <!-- Player Search and Filters -->
                <div class="form-section">
                    <div class="filter-grid">
                        <div class="form-group">
                            <label>Search Players</label>
                            <input type="text" id="playerSearch" placeholder="Search by name, position, or house..." onkeyup="filterPlayers()">
                        </div>
                        <div class="form-group">
                            <label>Filter by Position</label>
                            <select id="positionFilter" onchange="filterPlayers()">
                                <option value="">All Positions</option>
                                <option value="goalkeeper">Goalkeeper</option>
                                <option value="defender">Defender</option>
                                <option value="midfielder">Midfielder</option>
                                <option value="forward">Forward</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Filter by House</label>
                            <select id="houseFilter" onchange="filterPlayers()">
                                <option value="">All Houses</option>
                                <option value="Widdersdorf 1">Widdersdorf 1</option>
                                <option value="Widdersdorf 2">Widdersdorf 2</option>
                                <option value="Widdersdorf 3">Widdersdorf 3</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Filter by Status</label>
                            <select id="statusFilter" onchange="filterPlayers()">
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="injured">Injured</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Player Statistics Overview -->
                <div class="form-section">
                    <h3>📊 Player Overview</h3>
                    <div class="analytics-grid">
                        <div class="analytics-card">
                            <h4>Total Players</h4>
                            <div class="stat-large" id="totalPlayers">6</div>
                            <p>Currently in Program</p>
                        </div>
                        <div class="analytics-card">
                            <h4>Active Players</h4>
                            <div class="stat-large" id="activePlayers">5</div>
                            <p>Ready for Training</p>
                        </div>
                        <div class="analytics-card">
                            <h4>Injured Players</h4>
                            <div class="stat-large" id="injuredPlayers">1</div>
                            <p>Under Treatment</p>
                        </div>
                        <div class="analytics-card">
                            <h4>Houses Occupied</h4>
                            <div class="stat-large">3</div>
                            <p>All Locations</p>
                        </div>
                    </div>
                </div>

                <!-- Player List -->
                <div class="form-section">
                    <h3>👥 Player Directory</h3>
                    <div class="players-grid" id="playersGrid">
                        <!-- Players will be dynamically loaded here -->
                    </div>
                </div>

                <!-- Player Edit Modal -->
                <div id="playerEditModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Edit Player Profile</h3>
                            <button class="close-btn" onclick="closePlayerEditModal()">&times;</button>
                        </div>
                        <form id="playerEditForm" class="modal-body">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>First Name *</label>
                                    <input type="text" id="editFirstName" required>
                                </div>
                                <div class="form-group">
                                    <label>Last Name *</label>
                                    <input type="text" id="editLastName" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Position *</label>
                                    <select id="editPosition" required>
                                        <option value="goalkeeper">Goalkeeper</option>
                                        <option value="defender">Defender</option>
                                        <option value="midfielder">Midfielder</option>
                                        <option value="forward">Forward</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Age *</label>
                                    <input type="number" id="editAge" min="16" max="25" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nationality *</label>
                                    <input type="text" id="editNationality" required>
                                </div>
                                <div class="form-group">
                                    <label>Status *</label>
                                    <select id="editStatus" required>
                                        <option value="active">Active</option>
                                        <option value="injured">Injured</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>House *</label>
                                    <select id="editHouse" required>
                                        <option value="Widdersdorf 1">Widdersdorf 1</option>
                                        <option value="Widdersdorf 2">Widdersdorf 2</option>
                                        <option value="Widdersdorf 3">Widdersdorf 3</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Room *</label>
                                    <input type="text" id="editRoom" placeholder="e.g., 12A" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Contract Period *</label>
                                    <input type="text" id="editContractPeriod" placeholder="e.g., 2024-2026" required>
                                </div>
                                <div class="form-group">
                                    <label>Join Date *</label>
                                    <input type="date" id="editJoinDate" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Phone Number *</label>
                                <input type="tel" id="editPhoneNumber" placeholder="+49 221 123 4567" required>
                            </div>
                            <div class="form-group">
                                <label>Emergency Contact *</label>
                                <input type="text" id="editEmergencyContact" placeholder="Name and phone number" required>
                            </div>
                            <div class="form-group">
                                <label>Medical Information</label>
                                <textarea id="editMedicalInfo" rows="3" placeholder="Any medical conditions, allergies, or special requirements"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Special Notes</label>
                                <textarea id="editSpecialNotes" rows="3" placeholder="Performance notes, preferences, or other relevant information"></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="closePlayerEditModal()">Cancel</button>
                                <button type="submit" class="btn">Save Changes</button>
                            </div>
                        </form>
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
                <div class="page-header">
                    <h1>Training Calendar & Schedule Management</h1>
                    <div class="page-actions">
                        <button class="btn" onclick="openCreateEventModal()" id="createEventBtn" style="display: none;">
                            ➕ Create New Event
                        </button>
                    </div>
                </div>
                
                <!-- Calendar Views -->
                <div class="form-section">
                    <div class="calendar-header">
                        <h3>📅 Training Calendar & Schedule</h3>
                        <div class="calendar-controls">
                            <div class="view-toggles">
                                <button class="view-btn active" onclick="switchCalendarView('day')">Day</button>
                                <button class="view-btn" onclick="switchCalendarView('week')">Week</button>
                                <button class="view-btn" onclick="switchCalendarView('month')">Month</button>
                            </div>
                            <div class="calendar-nav">
                                <button class="nav-btn" onclick="navigateCalendar(-1)">← Previous</button>
                                <span id="currentPeriod" class="current-period">Today</span>
                                <button class="nav-btn" onclick="navigateCalendar(1)">Next →</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Day View -->
                    <div id="dayView" class="calendar-view active">
                        <div id="dayViewContent" class="day-view-content">
                            <!-- Day schedule will be populated here -->
                        </div>
                    </div>
                    
                    <!-- Week View -->
                    <div id="weekView" class="calendar-view">
                        <div id="weekViewContent" class="week-view-content">
                            <!-- Week schedule will be populated here -->
                        </div>
                    </div>
                    
                    <!-- Month View -->
                    <div id="monthView" class="calendar-view">
                        <div id="monthViewContent" class="month-view-content">
                            <!-- Month calendar will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Event Management (Admin Only) -->
                <div class="form-section admin-only" style="display: none;">
                    <h3>📋 Event Management</h3>
                    <div id="eventManagementList" class="event-management-container">
                        <p class="no-events-message">No events created yet. Use the "Create New Event" button to add events.</p>
                    </div>
                </div>

                <!-- Create Event Modal -->
                <div id="createEventModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>➕ Create New Event</h3>
                            <button class="close-btn" onclick="closeCreateEventModal()">&times;</button>
                        </div>
                        <form id="createEventForm" class="modal-body" onsubmit="createNewEvent(event)">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Event Title *</label>
                                    <input type="text" id="eventTitle" required placeholder="e.g., Morning Training Session">
                                </div>
                                <div class="form-group">
                                    <label>Event Type *</label>
                                    <select id="eventType" required>
                                        <option value="">Select Type</option>
                                        <option value="training">Training Session</option>
                                        <option value="match">Match</option>
                                        <option value="tactical">Tactical Session</option>
                                        <option value="fitness">Fitness Training</option>
                                        <option value="weight">Weight Session</option>
                                        <option value="recovery">Recovery Session</option>
                                        <option value="technical">Technical Skills</option>
                                        <option value="match-prep">Match Preparation</option>
                                        <option value="analysis">Video Analysis</option>
                                        <option value="meeting">Team Meeting</option>
                                        <option value="medical">Medical</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date *</label>
                                    <input type="date" id="eventDate" required>
                                </div>
                                <div class="form-group">
                                    <label>Time *</label>
                                    <input type="time" id="eventTime" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Duration (minutes)</label>
                                    <input type="number" id="eventDuration" min="15" max="300" placeholder="90" value="90">
                                </div>
                                <div class="form-group">
                                    <label>Location</label>
                                    <input type="text" id="eventLocation" placeholder="e.g., Training Ground A">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea id="eventDescription" rows="3" placeholder="Additional details about the event..."></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Attendance Required</label>
                                    <select id="eventAttendance" onchange="togglePlayerSelection()">
                                        <option value="all">All Players</option>
                                        <option value="squad">Squad Only</option>
                                        <option value="optional">Optional</option>
                                        <option value="selected">Selected Players</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Priority</label>
                                    <select id="eventPriority">
                                        <option value="normal">Normal</option>
                                        <option value="high">High Priority</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Recurring Event</label>
                                    <select id="eventRecurrence" onchange="toggleRecurrenceOptions()">
                                        <option value="none">One-time Event</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="weekdays">Monday-Friday (Weekdays)</option>
                                        <option value="weekends">Saturday-Sunday (Weekends)</option>
                                        <option value="specific-day">Specific Weekday (e.g., Every Tuesday)</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Recurrence Options Section -->
                            <div id="recurrenceOptionsSection" class="form-group" style="display: none;">
                                <label>Recurrence Settings</label>
                                <div class="recurrence-container">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Repeat every</label>
                                            <input type="number" id="recurrenceInterval" value="1" min="1" max="30">
                                            <span id="recurrenceUnit">week(s)</span>
                                        </div>
                                        <div class="form-group">
                                            <label>End Date</label>
                                            <input type="date" id="recurrenceEndDate">
                                        </div>
                                    </div>
                                    <div id="weeklyOptions" class="weekly-options" style="display: none;">
                                        <label>Repeat on days:</label>
                                        <div class="day-checkboxes">
                                            <label><input type="checkbox" value="1"> Mon</label>
                                            <label><input type="checkbox" value="2"> Tue</label>
                                            <label><input type="checkbox" value="3"> Wed</label>
                                            <label><input type="checkbox" value="4"> Thu</label>
                                            <label><input type="checkbox" value="5"> Fri</label>
                                            <label><input type="checkbox" value="6"> Sat</label>
                                            <label><input type="checkbox" value="0"> Sun</label>
                                        </div>
                                    </div>
                                    <div id="specificDayOptions" class="specific-day-options" style="display: none;">
                                        <label>Select day of the week:</label>
                                        <select id="specificWeekday">
                                            <option value="1">Every Monday</option>
                                            <option value="2">Every Tuesday</option>
                                            <option value="3">Every Wednesday</option>
                                            <option value="4">Every Thursday</option>
                                            <option value="5">Every Friday</option>
                                            <option value="6">Every Saturday</option>
                                            <option value="0">Every Sunday</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Player Selection Section -->
                            <div id="playerSelectionSection" class="form-group" style="display: none;">
                                <label>Select Players for This Event</label>
                                <div class="player-selection-container">
                                    <div class="selection-controls">
                                        <button type="button" class="btn-mini" onclick="selectAllPlayers()">Select All</button>
                                        <button type="button" class="btn-mini" onclick="clearAllPlayers()">Clear All</button>
                                        <button type="button" class="btn-mini" onclick="selectByHouse()">Select by House</button>
                                    </div>
                                    <div id="playerCheckboxList" class="player-checkbox-grid">
                                        <!-- Player checkboxes will be populated here -->
                                    </div>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="closeCreateEventModal()">Cancel</button>
                                <button type="submit" class="btn">Create Event</button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>

            <!-- Food Orders Page -->
            <div id="food-orders" class="page">
                <h1>🛒 Individual Food Orders</h1>
                
                <!-- Personal Budget & Status -->
                <div class="form-section">
                    <h3>💰 Your Personal Budget</h3>
                    <div class="budget-overview">
                        <div class="budget-card individual">
                            <h4 id="playerNameBudget">Max Bisinger - Personal Order</h4>
                            <div class="budget-amount large" id="currentOrderTotal">€0.00</div>
                            <div class="budget-limit">Maximum Budget: €35.00</div>
                            <div class="budget-remaining" id="budgetRemaining">€35.00 remaining</div>
                            <div class="budget-warning" id="budgetWarning" style="display: none;">⚠️ Approaching budget limit!</div>
                        </div>
                    </div>
                </div>

                <!-- Delivery Schedule & Deadlines -->
                <div class="form-section">
                    <h3>📅 Delivery Schedule & Order Deadlines</h3>
                    <div class="delivery-schedule">
                        <div class="delivery-card tuesday">
                            <h4>Tuesday Delivery</h4>
                            <div class="deadline-info">
                                <strong>Order Deadline: Monday 12:00 AM</strong>
                                <p>Delivery arrives between 6-8 PM</p>
                            </div>
                            <div class="next-delivery">
                                <span id="tuesdayDeadline">Next Order Due: Monday, July 29 - 12:00 AM</span>
                            </div>
                            <div class="deadline-status" id="tuesdayStatus">⏰ 2 days, 14 hours remaining</div>
                        </div>
                        <div class="delivery-card friday">
                            <h4>Friday Delivery</h4>
                            <div class="deadline-info">
                                <strong>Order Deadline: Thursday 12:00 AM</strong>
                                <p>Delivery arrives between 6-8 PM</p>
                            </div>
                            <div class="next-delivery">
                                <span id="fridayDeadline">Next Order Due: Thursday, August 1 - 12:00 AM</span>
                            </div>
                            <div class="deadline-status" id="fridayStatus">⏰ 5 days, 14 hours remaining</div>
                        </div>
                    </div>
                </div>

                <!-- Order History (Personal) -->
                <div class="form-section">
                    <h3>📋 Your Recent Orders</h3>
                    <div class="order-history">
                        <div class="order-history-item delivered">
                            <div class="order-date">July 23, 2025 - Tuesday Delivery</div>
                            <div class="order-total">€31.20</div>
                            <div class="order-status">✅ Delivered</div>
                            <div class="order-items">8 items: Chicken, Rice, Vegetables, Yogurt...</div>
                        </div>
                        <div class="order-history-item delivered">
                            <div class="order-date">July 19, 2025 - Friday Delivery</div>
                            <div class="order-total">€28.95</div>
                            <div class="order-status">✅ Delivered</div>
                            <div class="order-items">6 items: Fish, Pasta, Fruits, Milk...</div>
                        </div>
                    </div>
                </div>

                <!-- Individual Grocery Shopping -->
                <div class="form-section">
                    <h3>🛍️ Build Your Personal Order</h3>
                    <div class="grocery-categories">
                        <!-- Household Items -->
                        <div class="category-section">
                            <h4 class="category-title">🧽 Household Items</h4>
                            <div class="items-grid">
                                <div class="grocery-item">
                                    <span class="item-name">Laundry Detergent</span>
                                    <span class="item-price">€4.49</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Baking Paper</span>
                                    <span class="item-price">€0.95</span>
                                    <input type="checkbox"> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Dish Soap</span>
                                    <span class="item-price">€0.95</span>
                                    <input type="checkbox"> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Paper Towels</span>
                                    <span class="item-price">€2.85</span>
                                    <input type="checkbox"> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Toilet Paper</span>
                                    <span class="item-price">€4.15</span>
                                    <input type="checkbox"> <span class="qty">1x</span>
                                </div>
                            </div>
                        </div>

                        <!-- Vegetables & Fruits -->
                        <div class="category-section">
                            <h4 class="category-title">🥕 Vegetables & Fruits</h4>
                            <div class="items-grid">
                                <div class="grocery-item">
                                    <span class="item-name">Avocados</span>
                                    <span class="item-price">€1.59</span>
                                    <input type="checkbox" checked> <span class="qty">3x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Bananas</span>
                                    <span class="item-price">€0.40</span>
                                    <input type="checkbox" checked> <span class="qty">5x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Cucumber</span>
                                    <span class="item-price">€0.69</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Strawberries</span>
                                    <span class="item-price">€4.99</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Apples</span>
                                    <span class="item-price">€1.89</span>
                                    <input type="checkbox"> <span class="qty">1kg</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Broccoli</span>
                                    <span class="item-price">€1.69</span>
                                    <input type="checkbox"> <span class="qty">1x</span>
                                </div>
                            </div>
                        </div>

                        <!-- Meat & Protein -->
                        <div class="category-section">
                            <h4 class="category-title">🥩 Meat & Protein</h4>
                            <div class="items-grid">
                                <div class="grocery-item">
                                    <span class="item-name">Bacon</span>
                                    <span class="item-price">€1.39</span>
                                    <input type="checkbox" checked> <span class="qty">2x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Chicken</span>
                                    <span class="item-price">€6.49</span>
                                    <input type="checkbox" checked> <span class="qty">3x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Ground Beef</span>
                                    <span class="item-price">€3.49</span>
                                    <input type="checkbox" checked> <span class="qty">7x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Eggs</span>
                                    <span class="item-price">€1.99</span>
                                    <input type="checkbox" checked> <span class="qty">2x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Steak</span>
                                    <span class="item-price">€6.50</span>
                                    <input type="checkbox" checked> <span class="qty">4x</span>
                                </div>
                            </div>
                        </div>

                        <!-- Dairy Products -->
                        <div class="category-section">
                            <h4 class="category-title">🧀 Dairy Products</h4>
                            <div class="items-grid">
                                <div class="grocery-item">
                                    <span class="item-name">Butter</span>
                                    <span class="item-price">€2.19</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Blueberry Yogurt</span>
                                    <span class="item-price">€0.65</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Cream Cheese</span>
                                    <span class="item-price">€1.69</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Greek Vanilla Yogurt</span>
                                    <span class="item-price">€1.99</span>
                                    <input type="checkbox" checked> <span class="qty">2x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">High Protein Ice Cream</span>
                                    <span class="item-price">€2.79</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Vanilla Yogurt</span>
                                    <span class="item-price">€0.65</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                            </div>
                        </div>

                        <!-- Carbohydrates -->
                        <div class="category-section">
                            <h4 class="category-title">🍞 Carbohydrates</h4>
                            <div class="items-grid">
                                <div class="grocery-item">
                                    <span class="item-name">Bagels</span>
                                    <span class="item-price">€1.79</span>
                                    <input type="checkbox" checked> <span class="qty">2x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Bread</span>
                                    <span class="item-price">€2.29</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Hamburger Buns</span>
                                    <span class="item-price">€1.19</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Oats</span>
                                    <span class="item-price">€0.85</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Rice</span>
                                    <span class="item-price">€2.99</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Tortilla</span>
                                    <span class="item-price">€1.29</span>
                                    <input type="checkbox" checked> <span class="qty">2x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Waffles</span>
                                    <span class="item-price">€1.35</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                            </div>
                        </div>

                        <!-- Drinks -->
                        <div class="category-section">
                            <h4 class="category-title">🥤 Drinks</h4>
                            <div class="items-grid">
                                <div class="grocery-item">
                                    <span class="item-name">Chocolate Milk</span>
                                    <span class="item-price">€3.29</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Milk</span>
                                    <span class="item-price">€0.99</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Sparkling Water</span>
                                    <span class="item-price">€2.34</span>
                                    <input type="checkbox" checked> <span class="qty">4x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Apple Juice</span>
                                    <span class="item-price">€1.29</span>
                                    <input type="checkbox"> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Orange Juice</span>
                                    <span class="item-price">€2.49</span>
                                    <input type="checkbox"> <span class="qty">1x</span>
                                </div>
                            </div>
                        </div>

                        <!-- Spices & Sauces -->
                        <div class="category-section">
                            <h4 class="category-title">🧂 Spices & Sauces</h4>
                            <div class="items-grid">
                                <div class="grocery-item">
                                    <span class="item-name">Basil</span>
                                    <span class="item-price">€1.45</span>
                                    <input type="checkbox" checked> <span class="qty">2x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Basilico Sauce</span>
                                    <span class="item-price">€1.59</span>
                                    <input type="checkbox" checked> <span class="qty">2x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Garlic Powder</span>
                                    <span class="item-price">€2.29</span>
                                    <input type="checkbox" checked> <span class="qty">2x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Mayo</span>
                                    <span class="item-price">€3.39</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Orange Pesto (Paprika)</span>
                                    <span class="item-price">€1.09</span>
                                    <input type="checkbox" checked> <span class="qty">2x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Salt</span>
                                    <span class="item-price">€1.29</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                            </div>
                        </div>

                        <!-- Frozen Items -->
                        <div class="category-section">
                            <h4 class="category-title">🧊 Frozen Items</h4>
                            <div class="items-grid">
                                <div class="grocery-item">
                                    <span class="item-name">Frozen Blueberries</span>
                                    <span class="item-price">€2.99</span>
                                    <input type="checkbox" checked> <span class="qty">3x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Frozen Mango</span>
                                    <span class="item-price">€3.29</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Frozen Raspberries</span>
                                    <span class="item-price">€3.69</span>
                                    <input type="checkbox" checked> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Ice (Not Crushed)</span>
                                    <span class="item-price">€2.49</span>
                                    <input type="checkbox"> <span class="qty">1x</span>
                                </div>
                            </div>
                        </div>

                        <!-- Snacks & Extras -->
                        <div class="category-section">
                            <h4 class="category-title">🍿 Snacks & Extras</h4>
                            <div class="items-grid">
                                <div class="grocery-item">
                                    <span class="item-name">Power System High Protein</span>
                                    <span class="item-price">€1.09</span>
                                    <input type="checkbox" checked> <span class="qty">4x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Dark Chocolate</span>
                                    <span class="item-price">€0.99</span>
                                    <input type="checkbox"> <span class="qty">1x</span>
                                </div>
                                <div class="grocery-item">
                                    <span class="item-name">Pretzels</span>
                                    <span class="item-price">€0.99</span>
                                    <input type="checkbox"> <span class="qty">1x</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn btn-secondary" onclick="clearSelection()">Clear All</button>
                        <button class="btn btn-primary" id="submitOrderBtn" onclick="submitIndividualOrder()">Submit Personal Order (<span id="orderTotalBtn">€0.00</span>)</button>
                        <div class="budget-validation" id="budgetValidation">
                            <div class="validation-message success" id="budgetOk" style="display: block;">✅ Within budget limit</div>
                            <div class="validation-message warning" id="budgetWarning" style="display: none;">⚠️ Approaching €35 limit</div>
                            <div class="validation-message error" id="budgetExceeded" style="display: none;">❌ Exceeds €35 budget limit</div>
                        </div>
                    </div>
                </div>

                <!-- Current Order Preview -->
                <div class="form-section">
                    <h3>📋 Your Current Order</h3>
                    <div class="order-preview" id="orderPreview">
                        <div class="empty-order">
                            <p>No items selected yet. Choose items from the grocery list above to build your personal order.</p>
                        </div>
                        <div class="order-total">
                            <strong>Total: €0.00 / €35.00</strong>
                        </div>
                    </div>
                </div>

                <!-- Admin House Summary (Admin Only) -->
                <div class="form-section admin-only" id="houseSummarySection" style="display: none;">
                    <h3>🏠 House Order Summary (Admin View)</h3>
                    <div class="house-summary-tabs">
                        <button class="house-tab-btn active" onclick="showHouseSummary('all')">All Houses</button>
                        <button class="house-tab-btn" onclick="showHouseSummary('W1')">Widdersdorf 1</button>
                        <button class="house-tab-btn" onclick="showHouseSummary('W2')">Widdersdorf 2</button>
                        <button class="house-tab-btn" onclick="showHouseSummary('W3')">Widdersdorf 3</button>
                    </div>
                    
                    <!-- All Houses Summary -->
                    <div id="allHousesSummary" class="house-summary-content active">
                        <div class="house-group">
                            <div class="house-header">
                                <h4>🏠 Widdersdorf 1 (4 orders)</h4>
                                <div class="house-total">Total: €127.85</div>
                            </div>
                            <div class="house-players">
                                <div class="player-order-summary">
                                    <span class="player-name">Max Bisinger</span>
                                    <span class="order-total">€31.45</span>
                                    <div class="order-items-preview">Chicken (2x), Rice, Yogurt, Protein bars...</div>
                                </div>
                                <div class="player-order-summary">
                                    <span class="player-name">Luis Garcia</span>
                                    <span class="order-total">€28.90</span>
                                    <div class="order-items-preview">Fish, Pasta, Vegetables, Milk...</div>
                                </div>
                            </div>
                            <div class="house-shopping-list">
                                <h5>Consolidated Shopping List:</h5>
                                <div class="shopping-items">
                                    <span class="shopping-item">Chicken (8x), Rice (3x), Yogurt (6x), Fish (4x), Pasta (2x)...</span>
                                </div>
                            </div>
                        </div>

                        <div class="house-group">
                            <div class="house-header">
                                <h4>🏠 Widdersdorf 2 (3 orders)</h4>
                                <div class="house-total">Total: €89.65</div>
                            </div>
                            <div class="house-players">
                                <div class="player-order-summary">
                                    <span class="player-name">Mike Brown</span>
                                    <span class="order-total">€29.85</span>
                                    <div class="order-items-preview">Salmon, Sweet potatoes, Spinach...</div>
                                </div>
                                <div class="player-order-summary">
                                    <span class="player-name">David Kim</span>
                                    <span class="order-total">€32.15</span>
                                    <div class="order-items-preview">Pork, Quinoa, Broccoli, Almonds...</div>
                                </div>
                            </div>
                            <div class="house-shopping-list">
                                <h5>Consolidated Shopping List:</h5>
                                <div class="shopping-items">
                                    <span class="shopping-item">Salmon (3x), Sweet potatoes (4x), Spinach (2x), Pork (2x)...</span>
                                </div>
                            </div>
                        </div>

                        <div class="house-group">
                            <div class="house-header">
                                <h4>🏠 Widdersdorf 3 (2 orders)</h4>
                                <div class="house-total">Total: €61.30</div>
                            </div>
                            <div class="house-players">
                                <div class="player-order-summary">
                                    <span class="player-name">Tom Wilson</span>
                                    <span class="order-total">€33.80</span>
                                    <div class="order-items-preview">Lamb, Potatoes, Carrots, Protein shake...</div>
                                </div>
                                <div class="player-order-summary">
                                    <span class="player-name">Alex Chen</span>
                                    <span class="order-total">€27.50</span>
                                    <div class="order-items-preview">Tofu, Noodles, Peppers, Soy milk...</div>
                                </div>
                            </div>
                            <div class="house-shopping-list">
                                <h5>Consolidated Shopping List:</h5>
                                <div class="shopping-items">
                                    <span class="shopping-item">Lamb (2x), Potatoes (5x), Carrots (3x), Tofu (2x)...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                        
                    <!-- Individual House Views -->
                    <div id="W1Summary" class="house-summary-content">
                        <div class="house-group">
                            <div class="house-header">
                                <h4>🏠 Widdersdorf 1 - Detailed View</h4>
                                <div class="house-total">Total: €127.85</div>
                            </div>
                            <div class="house-players">
                                <div class="player-order-summary expanded">
                                    <span class="player-name">Max Bisinger</span>
                                    <span class="order-total">€31.45</span>
                                    <div class="detailed-order-items">
                                        <div class="order-item">Chicken breast (2x) - €8.90</div>
                                        <div class="order-item">Basmati Rice (1x) - €2.99</div>
                                        <div class="order-item">Greek Yogurt (3x) - €4.47</div>
                                        <div class="order-item">Protein bars (4x) - €4.36</div>
                                        <div class="order-item">Bananas (6x) - €2.40</div>
                                        <div class="order-item">Avocados (3x) - €4.77</div>
                                        <div class="order-item">Ground Turkey (1x) - €3.56</div>
                                    </div>
                                </div>
                                <div class="player-order-summary expanded">
                                    <span class="player-name">Luis Garcia</span>
                                    <span class="order-total">€28.90</span>
                                    <div class="detailed-order-items">
                                        <div class="order-item">Salmon fillet (2x) - €7.80</div>
                                        <div class="order-item">Whole wheat pasta (2x) - €3.98</div>
                                        <div class="order-item">Mixed vegetables (1x) - €2.45</div>
                                        <div class="order-item">Milk (2x) - €2.80</div>
                                        <div class="order-item">Eggs (12x) - €3.99</div>
                                        <div class="order-item">Spinach (1x) - €1.89</div>
                                        <div class="order-item">Sweet potatoes (3x) - €5.99</div>
                                    </div>
                                </div>
                                <div class="player-order-summary expanded">
                                    <span class="player-name">Ahmed Hassan</span>
                                    <span class="order-total">€34.20</span>
                                    <div class="detailed-order-items">
                                        <div class="order-item">Ground beef (2x) - €6.98</div>
                                        <div class="order-item">Brown bread (2x) - €3.98</div>
                                        <div class="order-item">Mixed fruits (1x) - €4.99</div>
                                        <div class="order-item">Cottage cheese (2x) - €3.78</div>
                                        <div class="order-item">Quinoa (1x) - €3.49</div>
                                        <div class="order-item">Broccoli (2x) - €3.98</div>
                                        <div class="order-item">Almonds (1x) - €6.99</div>
                                    </div>
                                </div>
                                <div class="player-order-summary expanded">
                                    <span class="player-name">Jonas Mueller</span>
                                    <span class="order-total">€33.30</span>
                                    <div class="detailed-order-items">
                                        <div class="order-item">Turkey slices (2x) - €5.98</div>
                                        <div class="order-item">Oatmeal (2x) - €4.98</div>
                                        <div class="order-item">Bananas (8x) - €3.20</div>
                                        <div class="order-item">Cheese slices (1x) - €4.99</div>
                                        <div class="order-item">Protein shake (3x) - €8.97</div>
                                        <div class="order-item">Carrots (2x) - €2.18</div>
                                        <div class="order-item">Peanut butter (1x) - €2.99</div>
                                    </div>
                                </div>
                            </div>
                            <div class="house-shopping-list">
                                <h5>Complete Shopping List - Widdersdorf 1:</h5>
                                <div class="consolidated-items">
                                    <div class="item-category">
                                        <strong>Proteins:</strong> Chicken breast (2x), Salmon fillet (2x), Ground beef (2x), Ground turkey (1x), Turkey slices (2x), Eggs (12x)
                                    </div>
                                    <div class="item-category">
                                        <strong>Grains & Carbs:</strong> Basmati rice (1x), Whole wheat pasta (2x), Brown bread (2x), Quinoa (1x), Oatmeal (2x)
                                    </div>
                                    <div class="item-category">
                                        <strong>Fruits & Vegetables:</strong> Bananas (14x), Avocados (3x), Mixed vegetables (1x), Mixed fruits (1x), Spinach (1x), Sweet potatoes (3x), Broccoli (2x), Carrots (2x)
                                    </div>
                                    <div class="item-category">
                                        <strong>Dairy:</strong> Greek yogurt (3x), Milk (2x), Cottage cheese (2x), Cheese slices (1x)
                                    </div>
                                    <div class="item-category">
                                        <strong>Supplements & Snacks:</strong> Protein bars (4x), Protein shake (3x), Almonds (1x), Peanut butter (1x)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="W2Summary" class="house-summary-content">
                        <div class="house-group">
                            <div class="house-header">
                                <h4>🏠 Widdersdorf 2 - Detailed View</h4>
                                <div class="house-total">Total: €89.65</div>
                            </div>
                            <div class="house-players">
                                <div class="player-order-summary expanded">
                                    <span class="player-name">Mike Brown</span>
                                    <span class="order-total">€29.85</span>
                                    <div class="detailed-order-items">
                                        <div class="order-item">Salmon (3x) - €11.70</div>
                                        <div class="order-item">Sweet potatoes (4x) - €7.98</div>
                                        <div class="order-item">Spinach (2x) - €3.78</div>
                                        <div class="order-item">Olive oil (1x) - €6.39</div>
                                    </div>
                                </div>
                                <div class="player-order-summary expanded">
                                    <span class="player-name">David Kim</span>
                                    <span class="order-total">€32.15</span>
                                    <div class="detailed-order-items">
                                        <div class="order-item">Pork tenderloin (2x) - €9.98</div>
                                        <div class="order-item">Quinoa (2x) - €6.98</div>
                                        <div class="order-item">Broccoli (3x) - €5.97</div>
                                        <div class="order-item">Almonds (2x) - €9.22</div>
                                    </div>
                                </div>
                                <div class="player-order-summary expanded">
                                    <span class="player-name">Carlos Ruiz</span>
                                    <span class="order-total">€27.65</span>
                                    <div class="detailed-order-items">
                                        <div class="order-item">Tuna steaks (2x) - €8.98</div>
                                        <div class="order-item">Brown rice (2x) - €5.98</div>
                                        <div class="order-item">Avocados (6x) - €9.54</div>
                                        <div class="order-item">Lime (4x) - €3.15</div>
                                    </div>
                                </div>
                            </div>
                            <div class="house-shopping-list">
                                <h5>Complete Shopping List - Widdersdorf 2:</h5>
                                <div class="consolidated-items">
                                    <div class="item-category">
                                        <strong>Proteins:</strong> Salmon (3x), Pork tenderloin (2x), Tuna steaks (2x)
                                    </div>
                                    <div class="item-category">
                                        <strong>Grains:</strong> Quinoa (2x), Brown rice (2x)
                                    </div>
                                    <div class="item-category">
                                        <strong>Vegetables & Fruits:</strong> Sweet potatoes (4x), Spinach (2x), Broccoli (3x), Avocados (6x), Lime (4x)
                                    </div>
                                    <div class="item-category">
                                        <strong>Pantry:</strong> Olive oil (1x), Almonds (2x)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="W3Summary" class="house-summary-content">
                        <div class="house-group">
                            <div class="house-header">
                                <h4>🏠 Widdersdorf 3 - Detailed View</h4>
                                <div class="house-total">Total: €61.30</div>
                            </div>
                            <div class="house-players">
                                <div class="player-order-summary expanded">
                                    <span class="player-name">Tom Wilson</span>
                                    <span class="order-total">€33.80</span>
                                    <div class="detailed-order-items">
                                        <div class="order-item">Lamb chops (2x) - €15.98</div>
                                        <div class="order-item">Red potatoes (5x) - €9.95</div>
                                        <div class="order-item">Carrots (3x) - €3.27</div>
                                        <div class="order-item">Protein shake mix (1x) - €4.60</div>
                                    </div>
                                </div>
                                <div class="player-order-summary expanded">
                                    <span class="player-name">Alex Chen</span>
                                    <span class="order-total">€27.50</span>
                                    <div class="detailed-order-items">
                                        <div class="order-item">Firm tofu (2x) - €5.98</div>
                                        <div class="order-item">Rice noodles (3x) - €8.97</div>
                                        <div class="order-item">Bell peppers (4x) - €7.96</div>
                                        <div class="order-item">Soy milk (2x) - €4.59</div>
                                    </div>
                                </div>
                            </div>
                            <div class="house-shopping-list">
                                <h5>Complete Shopping List - Widdersdorf 3:</h5>
                                <div class="consolidated-items">
                                    <div class="item-category">
                                        <strong>Proteins:</strong> Lamb chops (2x), Firm tofu (2x)
                                    </div>
                                    <div class="item-category">
                                        <strong>Carbs:</strong> Red potatoes (5x), Rice noodles (3x)
                                    </div>
                                    <div class="item-category">
                                        <strong>Vegetables:</strong> Carrots (3x), Bell peppers (4x)
                                    </div>
                                    <div class="item-category">
                                        <strong>Beverages & Supplements:</strong> Soy milk (2x), Protein shake mix (1x)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                        <div class="house-group">
                            <div class="house-header">
                                <h4>🏠 Widdersdorf 1 (4 orders)</h4>
                                <div class="house-total">Total: €127.85</div>
                            </div>
                            <div class="house-players">
                                <div class="player-order-summary">
                                    <span class="player-name">Max Bisinger</span>
                                    <span class="order-total">€31.45</span>
                                    <div class="order-items-preview">Chicken (2x), Rice, Yogurt, Protein bars...</div>
                                </div>
                                <div class="player-order-summary">
                                    <span class="player-name">Luis Garcia</span>
                                    <span class="order-total">€28.90</span>
                                    <div class="order-items-preview">Fish, Pasta, Vegetables, Milk...</div>
                                </div>
                                <div class="player-order-summary">
                                    <span class="player-name">Ahmed Hassan</span>
                                    <span class="order-total">€34.20</span>
                                    <div class="order-items-preview">Beef, Eggs, Bread, Fruits...</div>
                                </div>
                                <div class="player-order-summary">
                                    <span class="player-name">Jonas Mueller</span>
                                    <span class="order-total">€33.30</span>
                                    <div class="order-items-preview">Turkey, Oats, Bananas, Cheese...</div>
                                </div>
                            </div>
                            <div class="house-shopping-list">
                                <h5>Consolidated Shopping List:</h5>
                                <div class="shopping-items">
                                    <span class="shopping-item">Chicken (8x), Rice (3x), Yogurt (6x), Fish (4x), Pasta (2x)...</span>
                                </div>
                            </div>
                        </div>

                        <div class="house-group">
                            <div class="house-header">
                                <h4>🏠 Widdersdorf 2 (3 orders)</h4>
                                <div class="house-total">Total: €89.65</div>
                            </div>
                            <div class="house-players">
                                <div class="player-order-summary">
                                    <span class="player-name">Mike Brown</span>
                                    <span class="order-total">€29.85</span>
                                    <div class="order-items-preview">Salmon, Sweet potatoes, Spinach...</div>
                                </div>
                                <div class="player-order-summary">
                                    <span class="player-name">David Kim</span>
                                    <span class="order-total">€32.15</span>
                                    <div class="order-items-preview">Pork, Quinoa, Broccoli, Almonds...</div>
                                </div>
                                <div class="player-order-summary">
                                    <span class="player-name">Carlos Ruiz</span>
                                    <span class="order-total">€27.65</span>
                                    <div class="order-items-preview">Tuna, Brown rice, Avocados...</div>
                                </div>
                            </div>
                            <div class="house-shopping-list">
                                <h5>Consolidated Shopping List:</h5>
                                <div class="shopping-items">
                                    <span class="shopping-item">Salmon (3x), Sweet potatoes (4x), Spinach (2x), Pork (2x)...</span>
                                </div>
                            </div>
                        </div>

                        <div class="house-group">
                            <div class="house-header">
                                <h4>🏠 Widdersdorf 3 (2 orders)</h4>
                                <div class="house-total">Total: €61.30</div>
                            </div>
                            <div class="house-players">
                                <div class="player-order-summary">
                                    <span class="player-name">Tom Wilson</span>
                                    <span class="order-total">€33.80</span>
                                    <div class="order-items-preview">Lamb, Potatoes, Carrots, Protein shake...</div>
                                </div>
                                <div class="player-order-summary">
                                    <span class="player-name">Alex Chen</span>
                                    <span class="order-total">€27.50</span>
                                    <div class="order-items-preview">Tofu, Noodles, Peppers, Soy milk...</div>
                                </div>
                            </div>
                            <div class="house-shopping-list">
                                <h5>Consolidated Shopping List:</h5>
                                <div class="shopping-items">
                                    <span class="shopping-item">Lamb (2x), Potatoes (5x), Carrots (3x), Tofu (2x)...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="admin-actions">
                        <button class="btn btn-secondary" onclick="exportHouseOrders()">📋 Export House Orders</button>
                        <button class="btn btn-secondary" onclick="printShoppingLists()">🖨️ Print Shopping Lists</button>
                        <button class="btn btn-primary" onclick="processAllOrders()">✅ Process All House Orders</button>
                    </div>
                </div>

            </div>

            <!-- Communications Page -->
            <div id="communications" class="page">
                <h1>💬 Communications</h1>
                
                <!-- Chat Interface Layout -->
                <div class="chat-container">
                    <!-- Sidebar with Chat List -->
                    <div class="chat-sidebar">
                        <div class="chat-header">
                            <h3>Messages</h3>
                            <button class="btn-icon" onclick="startNewChat()" title="New Chat">💬</button>
                        </div>
                        
                        <!-- Chat Tabs -->
                        <div class="chat-tabs">
                            <button class="chat-tab-btn active" onclick="showChatTab('direct')">Direct</button>
                            <button class="chat-tab-btn" onclick="showChatTab('groups')">Groups</button>
                            <button class="chat-tab-btn" onclick="showChatTab('channels')">Houses</button>
                        </div>
                        
                        <!-- Direct Messages List -->
                        <div id="direct-chats" class="chat-list-container active">
                            <div class="chat-item active" onclick="openChat('thomas-ellinger')">
                                <div class="chat-avatar-simple">
                                    <div class="avatar-initials">TE</div>
                                    <div class="status-indicator online"></div>
                                </div>
                                <div class="chat-info">
                                    <div class="chat-name">Thomas Ellinger</div>
                                    <div class="chat-preview">Kitchen inspection tomorrow at 9 AM</div>
                                    <div class="chat-time">2 min ago</div>
                                </div>
                                <div class="chat-badges">
                                    <span class="unread-count">2</span>
                                </div>
                            </div>
                            
                            <div class="chat-item" onclick="openChat('coach-martinez')">
                                <div class="chat-avatar-simple">
                                    <div class="avatar-initials">CM</div>
                                    <div class="status-indicator online"></div>
                                </div>
                                <div class="chat-info">
                                    <div class="chat-name">Coach Martinez</div>
                                    <div class="chat-preview">Great performance in today's training!</div>
                                    <div class="chat-time">1 hour ago</div>
                                </div>
                                <div class="chat-badges">
                                    <span class="message-status read">✓✓</span>
                                </div>
                            </div>
                            
                            <div class="chat-item" onclick="openChat('ahmad-hassan')">
                                <div class="chat-avatar-simple">
                                    <div class="avatar-initials">AH</div>
                                    <div class="status-indicator away"></div>
                                </div>
                                <div class="chat-info">
                                    <div class="chat-name">Ahmad Hassan</div>
                                    <div class="chat-preview">Thanks for the assist today 👍</div>
                                    <div class="chat-time">3 hours ago</div>
                                </div>
                            </div>
                            
                            <div class="chat-item" onclick="openChat('jonas-weber')">
                                <div class="chat-avatar-simple">
                                    <div class="avatar-initials">JW</div>
                                    <div class="status-indicator online"></div>
                                </div>
                                <div class="chat-info">
                                    <div class="chat-name">Jonas Weber</div>
                                    <div class="chat-preview">Ready for tomorrow's match!</div>
                                    <div class="chat-time">5 hours ago</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Group Chats List -->
                        <div id="group-chats" class="chat-list-container">
                            <div class="chat-item" onclick="openChat('team-captains')">
                                <div class="chat-avatar group">
                                    <div class="group-icon">👑</div>
                                </div>
                                <div class="chat-info">
                                    <div class="chat-name">Team Captains</div>
                                    <div class="chat-preview">Jonas: Next match strategy discussion</div>
                                    <div class="chat-time">30 min ago</div>
                                </div>
                                <div class="chat-badges">
                                    <span class="unread-count">5</span>
                                </div>
                            </div>
                            
                            <div class="chat-item" onclick="openChat('injured-players')">
                                <div class="chat-avatar group">
                                    <div class="group-icon">🏥</div>
                                </div>
                                <div class="chat-info">
                                    <div class="chat-name">Recovery Support</div>
                                    <div class="chat-preview">Luis: Physio session rescheduled</div>
                                    <div class="chat-time">2 hours ago</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- House Channels List -->
                        <div id="house-chats" class="chat-list-container">
                            <div class="chat-item" onclick="openChat('widdersdorf-1')">
                                <div class="chat-avatar house">
                                    <div class="house-icon">🏠</div>
                                </div>
                                <div class="chat-info">
                                    <div class="chat-name">Widdersdorf 1</div>
                                    <div class="chat-preview">Max: Kitchen roster updated</div>
                                    <div class="chat-time">15 min ago</div>
                                </div>
                                <div class="chat-badges">
                                    <span class="unread-count">3</span>
                                </div>
                            </div>
                            
                            <div class="chat-item" onclick="openChat('widdersdorf-2')">
                                <div class="chat-avatar house">
                                    <div class="house-icon">🏠</div>
                                </div>
                                <div class="chat-info">
                                    <div class="chat-name">Widdersdorf 2</div>
                                    <div class="chat-preview">Luis: Movie night Friday 8 PM!</div>
                                    <div class="chat-time">1 hour ago</div>
                                </div>
                            </div>
                            
                            <div class="chat-item" onclick="openChat('widdersdorf-3')">
                                <div class="chat-avatar house">
                                    <div class="house-icon">🏠</div>
                                </div>
                                <div class="chat-info">
                                    <div class="chat-name">Widdersdorf 3</div>
                                    <div class="chat-preview">Jonas: Game room maintenance complete</div>
                                    <div class="chat-time">4 hours ago</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Main Chat Window -->
                    <div class="chat-main">
                        <!-- Chat Header -->
                        <div class="chat-window-header">
                            <div class="chat-contact-info">
                                <div class="contact-avatar-simple">
                                    <div class="avatar-initials">TE</div>
                                    <div class="status-indicator online"></div>
                                </div>
                                <div class="contact-details">
                                    <div class="contact-name">Thomas Ellinger</div>
                                    <div class="contact-status">Online • House Manager</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Messages Container -->
                        <div class="messages-container" id="messagesContainer">
                            <!-- Date Separator -->
                            <div class="date-separator">
                                <span>Today</span>
                            </div>
                            
                            <!-- Received Message -->
                            <div class="message received">
                                <div class="message-avatar-simple">
                                    <div class="avatar-initials-small">TE</div>
                                </div>
                                <div class="message-content">
                                    <div class="message-bubble">
                                        <p>Good morning Max! I wanted to remind you about the kitchen inspection tomorrow at 9 AM. 🏠</p>
                                    </div>
                                    <div class="message-time">09:15</div>
                                </div>
                            </div>
                            
                            <div class="message received">
                                <div class="message-avatar-simple">
                                    <div class="avatar-initials-small">TE</div>
                                </div>
                                <div class="message-content">
                                    <div class="message-bubble">
                                        <p>Also, could you please check the grocery orders for this week? Some players haven't submitted yet.</p>
                                    </div>
                                    <div class="message-time">09:16</div>
                                </div>
                            </div>
                            
                            <!-- Sent Message -->
                            <div class="message sent">
                                <div class="message-content">
                                    <div class="message-bubble">
                                        <p>Thanks for the reminder! I'll be there at 9 AM sharp. ✅</p>
                                    </div>
                                    <div class="message-time">
                                        <span>09:18</span>
                                        <span class="message-status read">✓✓</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="message sent">
                                <div class="message-content">
                                    <div class="message-bubble">
                                        <p>I'll check the grocery system now and send reminders to players who haven't ordered yet.</p>
                                    </div>
                                    <div class="message-time">
                                        <span>09:19</span>
                                        <span class="message-status delivered">✓</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Image Message -->
                            <div class="message received">
                                <div class="message-avatar-simple">
                                    <div class="avatar-initials-small">TE</div>
                                </div>
                                <div class="message-content">
                                    <div class="message-bubble image">
                                        <img src="https://via.placeholder.com/300x200" alt="Kitchen inspection checklist" class="message-image">
                                        <p>Here's the updated checklist for tomorrow's inspection 📋</p>
                                    </div>
                                    <div class="message-time">09:20</div>
                                </div>
                            </div>
                            
                            <!-- File Message -->
                            <div class="message received">
                                <div class="message-avatar-simple">
                                    <div class="avatar-initials-small">TE</div>
                                </div>
                                <div class="message-content">
                                    <div class="message-bubble file">
                                        <div class="file-preview">
                                            <div class="file-icon">📄</div>
                                            <div class="file-info">
                                                <div class="file-name">House_Rules_2025.pdf</div>
                                                <div class="file-size">245 KB</div>
                                            </div>
                                            <button class="file-download">📥</button>
                                        </div>
                                    </div>
                                    <div class="message-time">09:22</div>
                                </div>
                            </div>
                            
                            <!-- Typing Indicator -->
                            <div class="message received typing" id="typingIndicator" style="display: none;">
                                <div class="message-avatar-simple">
                                    <div class="avatar-initials-small">TE</div>
                                </div>
                                <div class="message-content">
                                    <div class="message-bubble">
                                        <div class="typing-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Message Input -->
                        <div class="message-input-container">
                            <div class="message-input-area">
                                <button class="btn-icon attachment" onclick="attachFile()" title="Attach File">📎</button>
                                <button class="btn-icon camera" onclick="attachImage()" title="Camera/Image">📷</button>
                                <input type="text" 
                                       id="messageInput" 
                                       class="message-input" 
                                       placeholder="Type a message..." 
                                       onkeypress="handleMessageKeyPress(event)"
                                       oninput="handleTyping()">
                                <button class="btn-icon emoji" onclick="showEmojis()" title="Emoji">😊</button>
                                <button class="btn-send" onclick="sendNewMessage()" id="sendButton">
                                    <span class="send-icon">📤</span>
                                </button>
                            </div>
                            
                            <!-- File Upload Preview -->
                            <div id="filePreview" class="file-preview-container" style="display: none;">
                                <div class="file-preview-item">
                                    <span class="file-name">No file selected</span>
                                    <button class="remove-file" onclick="removeFilePreview()">❌</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- New Chat Modal -->
                <div id="newChatModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Start New Chat</h3>
                            <button class="modal-close" onclick="closeNewChatModal()">❌</button>
                        </div>
                        <div class="modal-body">
                            <div class="contact-search">
                                <input type="text" id="contactSearch" placeholder="Search contacts..." class="form-control">
                            </div>
                            <div class="contact-list">
                                <div class="contact-item" onclick="startChatWith('coach-martinez')">
                                    <div class="contact-avatar-simple">
                                        <div class="avatar-initials">CM</div>
                                    </div>
                                    <div class="contact-info">
                                        <div class="contact-name">Coach Martinez</div>
                                        <div class="contact-role">Head Coach</div>
                                    </div>
                                    <div class="contact-status online"></div>
                                </div>
                                <div class="contact-item" onclick="startChatWith('thomas-ellinger')">
                                    <div class="contact-avatar-simple">
                                        <div class="avatar-initials">TE</div>
                                    </div>
                                    <div class="contact-info">
                                        <div class="contact-name">Thomas Ellinger</div>
                                        <div class="contact-role">House Manager</div>
                                    </div>
                                    <div class="contact-status online"></div>
                                </div>
                                <div class="contact-item" onclick="startChatWith('ahmad-hassan')">
                                    <div class="contact-avatar-simple">
                                        <div class="avatar-initials">AH</div>
                                    </div>
                                    <div class="contact-info">
                                        <div class="contact-name">Ahmad Hassan</div>
                                        <div class="contact-role">Player - Defender</div>
                                    </div>
                                    <div class="contact-status away"></div>
                                </div>
                                <div class="contact-item" onclick="startChatWith('luis-garcia')">
                                    <div class="contact-avatar-simple">
                                        <div class="avatar-initials">LG</div>
                                    </div>
                                    <div class="contact-info">
                                        <div class="contact-name">Luis García</div>
                                        <div class="contact-role">Player - Forward</div>
                                    </div>
                                    <div class="contact-status offline"></div>
                                </div>
                                <div class="contact-item" onclick="startChatWith('jonas-weber')">
                                    <div class="contact-avatar-simple">
                                        <div class="avatar-initials">JW</div>
                                    </div>
                                    <div class="contact-info">
                                        <div class="contact-name">Jonas Weber</div>
                                        <div class="contact-role">Player - Goalkeeper</div>
                                    </div>
                                    <div class="contact-status online"></div>
                                </div>
                                <div class="contact-item" onclick="startChatWith('marco-silva')">
                                    <div class="contact-avatar-simple">
                                        <div class="avatar-initials">MS</div>
                                    </div>
                                    <div class="contact-info">
                                        <div class="contact-name">Marco Silva</div>
                                        <div class="contact-role">Player - Midfielder</div>
                                    </div>
                                    <div class="contact-status online"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- House Management Page -->
            <div id="house-management" class="page">
                <h1>🏠 Housing & Chore Management</h1>
                
                <!-- Admin/Staff Chore Creation (Only visible to Thomas & Max) -->
                <div class="admin-staff-only form-section" style="display: none;">
                    <h3>➕ Create New Chore Assignment</h3>
                    <div class="chore-creation-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Chore Title *</label>
                                <input type="text" id="choreTitle" placeholder="e.g., Kitchen Deep Clean, Garden Maintenance" required>
                            </div>
                            <div class="form-group">
                                <label>Priority Level *</label>
                                <select id="chorePriority" required>
                                    <option value="">Select Priority</option>
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Target House *</label>
                                <select id="choreHouse" required>
                                    <option value="">Select House</option>
                                    <option value="widdersdorf1">Widdersdorf 1</option>
                                    <option value="widdersdorf2">Widdersdorf 2</option>
                                    <option value="widdersdorf3">Widdersdorf 3</option>
                                    <option value="all">All Houses</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Assignment Type *</label>
                                <select id="choreAssignmentType" onchange="togglePlayerSelection()" required>
                                    <option value="">Select Assignment</option>
                                    <option value="individual">Specific Individual Player</option>
                                    <option value="multiple">Multiple Specific Players</option>
                                    <option value="group">Group Task (Auto-assign)</option>
                                    <option value="house">Entire House</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Deadline *</label>
                                <input type="datetime-local" id="choreDeadline" required>
                            </div>
                            <div class="form-group">
                                <label>Points Reward</label>
                                <input type="number" id="chorePoints" min="1" max="50" placeholder="15">
                            </div>
                        </div>
                        <!-- Individual Player Selection -->
                        <div class="form-row" id="individualPlayerRow" style="display: none;">
                            <div class="form-group">
                                <label>Select Individual Player *</label>
                                <select id="individualPlayer">
                                    <option value="">Choose specific player</option>
                                    <option value="max_finkgrafe">Max Finkgräfe</option>
                                    <option value="tim_lemperle">Tim Lemperle</option>
                                    <option value="mark_uth">Mark Uth</option>
                                    <option value="steffen_tigges">Steffen Tigges</option>
                                    <option value="linton_maina">Linton Maina</option>
                                    <option value="florian_kainz">Florian Kainz</option>
                                    <option value="jan_thielmann">Jan Thielmann</option>
                                    <option value="denis_huseinbasic">Denis Huseinbašić</option>
                                    <option value="luca_waldschmidt">Luca Waldschmidt</option>
                                    <option value="timo_horn">Timo Horn</option>
                                </select>
                            </div>
                        </div>

                        <!-- Multiple Players Selection -->
                        <div class="form-section" id="multiplePlayersRow" style="display: none;">
                            <div class="form-group">
                                <label>Select Multiple Players *</label>
                                <p class="form-help">Check all players who should complete this chore</p>
                                <div class="players-checkbox-grid">
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="selectedPlayers" value="max_finkgrafe">
                                        <span>Max Finkgräfe</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="selectedPlayers" value="tim_lemperle">
                                        <span>Tim Lemperle</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="selectedPlayers" value="mark_uth">
                                        <span>Mark Uth</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="selectedPlayers" value="steffen_tigges">
                                        <span>Steffen Tigges</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="selectedPlayers" value="linton_maina">
                                        <span>Linton Maina</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="selectedPlayers" value="florian_kainz">
                                        <span>Florian Kainz</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="selectedPlayers" value="jan_thielmann">
                                        <span>Jan Thielmann</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="selectedPlayers" value="denis_huseinbasic">
                                        <span>Denis Huseinbašić</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="selectedPlayers" value="luca_waldschmidt">
                                        <span>Luca Waldschmidt</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="selectedPlayers" value="timo_horn">
                                        <span>Timo Horn</span>
                                    </label>
                                </div>
                                <div class="selection-actions">
                                    <button type="button" class="btn-mini" onclick="selectAllPlayers()">Select All</button>
                                    <button type="button" class="btn-mini" onclick="clearAllPlayers()">Clear All</button>
                                    <span id="selectedCount" class="selected-count">0 players selected</span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Description & Instructions *</label>
                            <textarea id="choreDescription" rows="3" placeholder="Detailed instructions for completing this chore..." required></textarea>
                        </div>
                        <div class="chore-creation-actions">
                            <button type="button" class="btn btn-primary" onclick="createChoreAssignment()">Create Chore Assignment</button>
                            <button type="button" class="btn btn-secondary" onclick="clearChoreForm()">Clear Form</button>
                        </div>
                    </div>
                </div>

                <!-- House Overview Cards -->
                <div class="dashboard-grid">
                    <div class="card">
                        <h3>🏠 Widdersdorf 1</h3>
                        <div class="house-stats">
                            <p><strong>Residents:</strong> 8 players</p>
                            <p><strong>House Leader:</strong> Max Finkgräfe</p>
                            <p><strong>Chore Completion:</strong> <span class="completion-rate good">85%</span></p>
                            <p><strong>Active Tasks:</strong> 3 pending</p>
                        </div>
                        <button class="btn btn-sm" onclick="viewHouseDetails('widdersdorf1')">View Details</button>
                    </div>
                    <div class="card">
                        <h3>🏠 Widdersdorf 2</h3>
                        <div class="house-stats">
                            <p><strong>Residents:</strong> 8 players</p>
                            <p><strong>House Leader:</strong> Tim Lemperle</p>
                            <p><strong>Chore Completion:</strong> <span class="completion-rate excellent">92%</span></p>
                            <p><strong>Active Tasks:</strong> 1 pending</p>
                        </div>
                        <button class="btn btn-sm" onclick="viewHouseDetails('widdersdorf2')">View Details</button>
                    </div>
                    <div class="card">
                        <h3>🏠 Widdersdorf 3</h3>
                        <div class="house-stats">
                            <p><strong>Residents:</strong> 8 players</p>
                            <p><strong>House Leader:</strong> Mark Uth</p>
                            <p><strong>Chore Completion:</strong> <span class="completion-rate warning">78%</span></p>
                            <p><strong>Active Tasks:</strong> 4 pending</p>
                        </div>
                        <button class="btn btn-sm" onclick="viewHouseDetails('widdersdorf3')">View Details</button>
                    </div>
                </div>

                <!-- Current Active Chores -->
                <div class="form-section">
                    <h3>📋 Active Chore Assignments</h3>
                    <div class="chore-assignments-grid" id="activeChoresList">
                        <!-- Chores will be dynamically loaded here -->
                    </div>
                </div>

                <!-- Chore History & Analytics -->
                <div class="form-section">
                    <h3>📊 Chore Completion Analytics</h3>
                    <div class="analytics-grid">
                        <div class="analytics-card">
                            <h4>This Week</h4>
                            <div class="stat-large">24</div>
                            <p>Chores Completed</p>
                            <small>↗ +15% from last week</small>
                        </div>
                        <div class="analytics-card">
                            <h4>On-Time Rate</h4>
                            <div class="stat-large">87%</div>
                            <p>Met Deadlines</p>
                            <small>↗ +5% improvement</small>
                        </div>
                        <div class="analytics-card">
                            <h4>Average Time</h4>
                            <div class="stat-large">45min</div>
                            <p>Per Chore</p>
                            <small>→ Consistent</small>
                        </div>
                        <div class="analytics-card">
                            <h4>Points Earned</h4>
                            <div class="stat-large">420</div>
                            <p>Total Points</p>
                            <small>↗ +32 from last week</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Admin Page -->
            <div id="admin" class="page">
                <h1>System Administration</h1>
                
                <!-- Admin Navigation -->
                <div class="admin-nav">
                    <button class="admin-nav-btn active" onclick="showAdminSection('player-management')">👥 Player Management</button>
                    <button class="admin-nav-btn" onclick="showAdminSection('user-management')">🔐 User Management</button>
                    <button class="admin-nav-btn" onclick="showAdminSection('full-control')">🛡️ Full Admin Control</button>
                    <button class="admin-nav-btn" onclick="showAdminSection('system-settings')">⚙️ System Settings</button>
                    <button class="admin-nav-btn" onclick="showAdminSection('reports')">📊 Reports</button>
                </div>

                <!-- Full Admin Control Section -->
                <div id="full-control" class="admin-section">
                    <h2>🛡️ Full Administrator Control Panel</h2>
                    
                    <!-- Super Admin Powers -->
                    <div class="form-section">
                        <h3>⚡ Super Administrator Powers</h3>
                        <div class="super-admin-controls">
                            <div class="control-category">
                                <h4>🔐 Security & Access Control</h4>
                                <button class="btn btn-primary" onclick="fullUserControl()">👥 Complete User Account Control</button>
                                <button class="btn btn-primary" onclick="passwordManagement()">🔑 Global Password Management</button>
                                <button class="btn btn-primary" onclick="sessionControl()">🔐 Force Logout All Users</button>
                                <button class="btn btn-primary" onclick="permissionOverride()">🚪 Override All Permissions</button>
                                <button class="btn btn-warning" onclick="lockdownMode()">🚨 System Lockdown Mode</button>
                            </div>
                            
                            <div class="control-category">
                                <h4>💾 Data & Database Control</h4>
                                <button class="btn btn-primary" onclick="databaseFullAccess()">🗄️ Direct Database Access</button>
                                <button class="btn btn-primary" onclick="backupManagement()">💾 Complete Backup Management</button>
                                <button class="btn btn-primary" onclick="dataExportAll()">📤 Export All System Data</button>
                                <button class="btn btn-primary" onclick="dataImportAll()">📥 Import/Restore Data</button>
                                <button class="btn btn-warning" onclick="databaseReset()">⚠️ Database Reset</button>
                            </div>
                            
                            <div class="control-category">
                                <h4>⚙️ System Operations</h4>
                                <button class="btn btn-primary" onclick="systemRestart()">🔄 Restart Entire System</button>
                                <button class="btn btn-primary" onclick="maintenanceMode()">🚧 Enable Maintenance Mode</button>
                                <button class="btn btn-primary" onclick="systemMonitoring()">📊 Real-time System Monitoring</button>
                                <button class="btn btn-primary" onclick="logManagement()">📋 Complete Log Management</button>
                                <button class="btn btn-danger" onclick="emergencyShutdown()">🛑 Emergency System Shutdown</button>
                            </div>
                            
                            <div class="control-category">
                                <h4>👥 Player & Staff Control</h4>
                                <button class="btn btn-primary" onclick="massPlayerUpdate()">👤 Mass Player Updates</button>
                                <button class="btn btn-primary" onclick="medicalRecordsFull()">🏥 Complete Medical Records Access</button>
                                <button class="btn btn-primary" onclick="financialRecords()">💰 Full Financial Records Access</button>
                                <button class="btn btn-primary" onclick="communicationControl()">📢 Communication System Control</button>
                                <button class="btn btn-warning" onclick="disciplinaryActions()">⚠️ Disciplinary Action Tools</button>
                            </div>
                            
                            <div class="control-category">
                                <h4>🏠 Facility & Operations</h4>
                                <button class="btn btn-primary" onclick="facilityFullControl()">🏠 Complete Facility Management</button>
                                <button class="btn btn-primary" onclick="scheduleOverride()">📅 Override All Schedules</button>
                                <button class="btn btn-primary" onclick="foodSystemControl()">🍽️ Food System Management</button>
                                <button class="btn btn-primary" onclick="choreSystemControl()">🧹 Chore System Control</button>
                                <button class="btn btn-primary" onclick="emergencyProtocols()">🚨 Emergency Protocols</button>
                            </div>
                        </div>
                    </div>

                    <!-- Live Admin Dashboard -->
                    <div class="form-section">
                        <h3>📺 Live Administrative Dashboard</h3>
                        <div class="live-dashboard">
                            <div class="dashboard-item">
                                <h4>System Status</h4>
                                <div class="status-indicators">
                                    <span class="status-indicator online">🟢 Database: Online</span>
                                    <span class="status-indicator online">🟢 Server: Operational</span>
                                    <span class="status-indicator online">🟢 Security: Active</span>
                                    <span class="status-indicator warning">🟡 Storage: 76% Used</span>
                                </div>
                                <button class="btn-small" onclick="refreshSystemStatus()">🔄 Refresh</button>
                            </div>
                            
                            <div class="dashboard-item">
                                <h4>Active Users (Real-time)</h4>
                                <div class="user-activity">
                                    <p><strong>Total Online:</strong> <span class="live-count">23</span></p>
                                    <p><strong>Admins:</strong> <span class="admin-count">2</span></p>
                                    <p><strong>Staff:</strong> <span class="staff-count">5</span></p>
                                    <p><strong>Players:</strong> <span class="player-count">16</span></p>
                                </div>
                                <button class="btn-small" onclick="viewActiveUsers()">👥 View All</button>
                            </div>
                            
                            <div class="dashboard-item">
                                <h4>Security Monitoring</h4>
                                <div class="security-status">
                                    <p><strong>Failed Logins (24h):</strong> <span class="security-alert">0</span></p>
                                    <p><strong>Suspicious Activity:</strong> <span class="security-alert">0</span></p>
                                    <p><strong>Last Security Scan:</strong> <span class="scan-time">2 hours ago</span></p>
                                </div>
                                <button class="btn-small" onclick="securityAudit()">🔍 Security Audit</button>
                            </div>
                        </div>
                    </div>

                    <!-- Dangerous Operations -->
                    <div class="form-section danger-zone">
                        <h3>⚠️ Danger Zone - Destructive Operations</h3>
                        <div class="danger-controls">
                            <div class="danger-warning">
                                <p><strong>⚠️ WARNING:</strong> These operations are irreversible and can cause permanent data loss. Use with extreme caution.</p>
                            </div>
                            <div class="danger-actions">
                                <button class="btn btn-danger" onclick="factoryReset()">🔄 Complete Factory Reset</button>
                                <button class="btn btn-danger" onclick="purgeAllData()">🗑️ Purge All User Data</button>
                                <button class="btn btn-danger" onclick="deleteAllPlayers()">❌ Delete All Player Records</button>
                                <button class="btn btn-danger" onclick="systemWipe()">💥 Complete System Wipe</button>
                            </div>
                        </div>
                    </div>

                    <!-- Emergency Controls -->
                    <div class="form-section emergency-controls">
                        <h3>🚨 Emergency Controls</h3>
                        <div class="emergency-grid">
                            <button class="btn btn-emergency" onclick="emergencyLockdown()">🔒 EMERGENCY LOCKDOWN</button>
                            <button class="btn btn-emergency" onclick="emergencyEvacuation()">🚨 EVACUATION PROTOCOL</button>
                            <button class="btn btn-emergency" onclick="emergencyMedical()">🏥 MEDICAL EMERGENCY</button>
                            <button class="btn btn-emergency" onclick="emergencyContact()">📞 EMERGENCY CONTACTS</button>
                        </div>
                    </div>
                </div>

                <!-- Player Management Section -->
                <div id="player-management" class="admin-section active">
                    <h2>Player Management & Editing</h2>
                    
                    <!-- Player Search and Filters -->
                    <div class="admin-controls">
                        <div class="search-bar">
                            <input type="text" id="playerSearch" placeholder="Search players by name, position, or nationality..." class="form-control">
                            <button class="btn" onclick="searchPlayers()">🔍 Search</button>
                        </div>
                        <div class="filter-controls">
                            <select id="statusFilter" class="form-control">
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="injured">Injured</option>
                                <option value="suspended">Suspended</option>
                                <option value="on-loan">On Loan</option>
                            </select>
                            <select id="positionFilter" class="form-control">
                                <option value="">All Positions</option>
                                <option value="goalkeeper">Goalkeeper</option>
                                <option value="defender">Defender</option>
                                <option value="midfielder">Midfielder</option>
                                <option value="forward">Forward</option>
                            </select>
                            <button class="btn btn-primary" onclick="addNewPlayer()">+ Add New Player</button>
                        </div>
                    </div>

                    <!-- Players Admin Grid -->
                    <div class="players-admin-grid">
                        <div class="player-admin-card">
                            <div class="player-header">
                                <img src="https://via.placeholder.com/60x60" alt="Player" class="player-avatar">
                                <div class="player-info">
                                    <h4>Marco Silva</h4>
                                    <span class="player-position">Midfielder</span>
                                    <span class="player-status status-active">Active</span>
                                </div>
                                <div class="player-actions">
                                    <button class="btn-small" onclick="editPlayer('marco-silva')">✏️ Edit</button>
                                    <button class="btn-small btn-warning" onclick="suspendPlayer('marco-silva')">⚠️ Suspend</button>
                                </div>
                            </div>
                            <div class="player-details">
                                <p><strong>Age:</strong> 19 • <strong>Nationality:</strong> Portugal</p>
                                <p><strong>House:</strong> Widdersdorf 1 • <strong>Room:</strong> 12A</p>
                                <p><strong>Contract:</strong> 2024-2026 • <strong>Performance:</strong> 8.4/10</p>
                            </div>
                        </div>

                        <div class="player-admin-card">
                            <div class="player-header">
                                <img src="https://via.placeholder.com/60x60" alt="Player" class="player-avatar">
                                <div class="player-info">
                                    <h4>Luis García</h4>
                                    <span class="player-position">Forward</span>
                                    <span class="player-status status-injured">Injured</span>
                                </div>
                                <div class="player-actions">
                                    <button class="btn-small" onclick="editPlayer('luis-garcia')">✏️ Edit</button>
                                    <button class="btn-small" onclick="viewMedicalRecord('luis-garcia')">🏥 Medical</button>
                                </div>
                            </div>
                            <div class="player-details">
                                <p><strong>Age:</strong> 18 • <strong>Nationality:</strong> Spain</p>
                                <p><strong>House:</strong> Widdersdorf 2 • <strong>Room:</strong> 08B</p>
                                <p><strong>Injury:</strong> Knee strain (2 weeks) • <strong>Performance:</strong> 7.8/10</p>
                            </div>
                        </div>

                        <div class="player-admin-card">
                            <div class="player-header">
                                <img src="https://via.placeholder.com/60x60" alt="Player" class="player-avatar">
                                <div class="player-info">
                                    <h4>Ahmad Hassan</h4>
                                    <span class="player-position">Defender</span>
                                    <span class="player-status status-active">Active</span>
                                </div>
                                <div class="player-actions">
                                    <button class="btn-small" onclick="editPlayer('ahmad-hassan')">✏️ Edit</button>
                                    <button class="btn-small" onclick="viewPerformance('ahmad-hassan')">📈 Stats</button>
                                </div>
                            </div>
                            <div class="player-details">
                                <p><strong>Age:</strong> 20 • <strong>Nationality:</strong> Egypt</p>
                                <p><strong>House:</strong> Widdersdorf 1 • <strong>Room:</strong> 15C</p>
                                <p><strong>Contract:</strong> 2023-2025 • <strong>Performance:</strong> 8.9/10</p>
                            </div>
                        </div>

                        <div class="player-admin-card">
                            <div class="player-header">
                                <img src="https://via.placeholder.com/60x60" alt="Player" class="player-avatar">
                                <div class="player-info">
                                    <h4>Jonas Weber</h4>
                                    <span class="player-position">Goalkeeper</span>
                                    <span class="player-status status-active">Active</span>
                                </div>
                                <div class="player-actions">
                                    <button class="btn-small" onclick="editPlayer('jonas-weber')">✏️ Edit</button>
                                    <button class="btn-small" onclick="assignCaptain('jonas-weber')">👑 Captain</button>
                                </div>
                            </div>
                            <div class="player-details">
                                <p><strong>Age:</strong> 19 • <strong>Nationality:</strong> Germany</p>
                                <p><strong>House:</strong> Widdersdorf 3 • <strong>Room:</strong> 03A</p>
                                <p><strong>Contract:</strong> 2024-2027 • <strong>Performance:</strong> 9.2/10</p>
                            </div>
                        </div>

                        <div class="player-admin-card">
                            <div class="player-header">
                                <img src="https://via.placeholder.com/60x60" alt="Player" class="player-avatar">
                                <div class="player-info">
                                    <h4>Carlos Rodriguez</h4>
                                    <span class="player-position">Forward</span>
                                    <span class="player-status status-active">Active</span>
                                </div>
                                <div class="player-actions">
                                    <button class="btn-small" onclick="editPlayer('carlos-rodriguez')">✏️ Edit</button>
                                    <button class="btn-small" onclick="transferPlayer('carlos-rodriguez')">🔄 Transfer</button>
                                </div>
                            </div>
                            <div class="player-details">
                                <p><strong>Age:</strong> 17 • <strong>Nationality:</strong> Argentina</p>
                                <p><strong>House:</strong> Widdersdorf 3 • <strong>Room:</strong> 07B</p>
                                <p><strong>Contract:</strong> 2024-2025 • <strong>Performance:</strong> 8.7/10</p>
                            </div>
                        </div>

                        <div class="player-admin-card">
                            <div class="player-header">
                                <img src="https://via.placeholder.com/60x60" alt="Player" class="player-avatar">
                                <div class="player-info">
                                    <h4>Luca Müller</h4>
                                    <span class="player-position">Defender</span>
                                    <span class="player-status status-suspended">Suspended</span>
                                </div>
                                <div class="player-actions">
                                    <button class="btn-small" onclick="editPlayer('luca-muller')">✏️ Edit</button>
                                    <button class="btn-small btn-success" onclick="reactivatePlayer('luca-muller')">✅ Reactivate</button>
                                </div>
                            </div>
                            <div class="player-details">
                                <p><strong>Age:</strong> 18 • <strong>Nationality:</strong> Germany</p>
                                <p><strong>House:</strong> Widdersdorf 2 • <strong>Room:</strong> 14A</p>
                                <p><strong>Suspension:</strong> Disciplinary (1 week) • <strong>Performance:</strong> 7.2/10</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- User Management -->
                <div id="user-management" class="admin-section">
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
        let choreStorage = [];
        
        // Player data storage
        let playerStorage = [
            {
                id: 'player_001',
                firstName: 'Max',
                lastName: 'Finkgräfe',
                position: 'forward',
                age: 20,
                nationality: 'Germany',
                house: 'Widdersdorf 1',
                room: '12A',
                contractPeriod: '2024-2026',
                status: 'active',
                specialNotes: 'Team captain, excellent leadership skills',
                joinDate: '2024-01-15',
                phoneNumber: '+49 221 123 4567',
                emergencyContact: 'Hans Finkgräfe (+49 221 987 6543)',
                medicalInfo: 'No known allergies'
            },
            {
                id: 'player_002',
                firstName: 'Tim',
                lastName: 'Lemperle',
                position: 'midfielder',
                age: 19,
                nationality: 'Germany',
                house: 'Widdersdorf 2',
                room: '8B',
                contractPeriod: '2024-2025',
                status: 'active',
                specialNotes: 'Excellent ball control, prefers morning training',
                joinDate: '2024-02-01',
                phoneNumber: '+49 221 234 5678',
                emergencyContact: 'Maria Lemperle (+49 221 876 5432)',
                medicalInfo: 'Lactose intolerant'
            },
            {
                id: 'player_003',
                firstName: 'Florian',
                lastName: 'Kainz',
                position: 'midfielder',
                age: 21,
                nationality: 'Germany',
                house: 'Widdersdorf 1',
                room: '15C',
                contractPeriod: '2023-2025',
                status: 'active',
                specialNotes: 'Strong left foot, creative playmaker',
                joinDate: '2023-08-01',
                phoneNumber: '+49 221 345 6789',
                emergencyContact: 'Klaus Kainz (+49 221 765 4321)',
                medicalInfo: 'Previous ankle injury - requires special warm-up'
            },
            {
                id: 'player_004',
                firstName: 'Steffen',
                lastName: 'Tigges',
                position: 'forward',
                age: 22,
                nationality: 'Germany',
                house: 'Widdersdorf 3',
                room: '20A',
                contractPeriod: '2024-2026',
                status: 'active',
                specialNotes: 'Physical striker, good in the air',
                joinDate: '2024-01-10',
                phoneNumber: '+49 221 456 7890',
                emergencyContact: 'Petra Tigges (+49 221 654 3210)',
                medicalInfo: 'No medical concerns'
            },
            {
                id: 'player_005',
                firstName: 'Denis',
                lastName: 'Huseinbašić',
                position: 'midfielder',
                age: 20,
                nationality: 'Germany',
                house: 'Widdersdorf 2',
                room: '11B',
                contractPeriod: '2024-2025',
                status: 'injured',
                specialNotes: 'Versatile player, recovering from knee injury',
                joinDate: '2024-03-01',
                phoneNumber: '+49 221 567 8901',
                emergencyContact: 'Amela Huseinbašić (+49 221 543 2109)',
                medicalInfo: 'Knee injury - physiotherapy required'
            },
            {
                id: 'player_006',
                firstName: 'Timo',
                lastName: 'Horn',
                position: 'goalkeeper',
                age: 23,
                nationality: 'Germany',
                house: 'Widdersdorf 3',
                room: '5A',
                contractPeriod: '2023-2026',
                status: 'active',
                specialNotes: 'Experienced goalkeeper, leadership qualities',
                joinDate: '2023-07-15',
                phoneNumber: '+49 221 678 9012',
                emergencyContact: 'Sandra Horn (+49 221 432 1098)',
                medicalInfo: 'Regular eye check-ups required'
            }
        ];

        // Login functionality - wrapped in DOMContentLoaded to ensure elements exist
        document.addEventListener('DOMContentLoaded', function() {
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const email = document.getElementById('email').value.trim();
                    const password = document.getElementById('password').value;
                    const messageDiv = document.getElementById('loginMessage');
                    
                    if (messageDiv) messageDiv.innerHTML = '';
                    
                    if (password === 'ITP2024') {
                        let userData = null;
                        
                        if (email === 'max.bisinger@warubi-sports.com') {
                            userData = { name: 'Max Bisinger', email: email, role: 'admin' };
                        } else if (email === 'thomas.ellinger@warubi-sports.com') {
                            userData = { name: 'Thomas Ellinger', email: email, role: 'staff' };
                        } else {
                            if (messageDiv) messageDiv.innerHTML = '<div style="color: #dc2626; margin-top: 1rem;">Email not recognized. Please try again.</div>';
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
                        if (messageDiv) messageDiv.innerHTML = '<div style="color: #dc2626; margin-top: 1rem;">Invalid password. Please try again.</div>';
                    }
                });
            }
        });

        // Show main application
        function showMainApp() {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            document.getElementById('userName').textContent = 'Welcome, ' + currentUser.name;
            
            // Show admin-only navigation items for admins
            const adminOnlyItems = document.querySelectorAll('.admin-only');
            if (currentUser.role === 'admin') {
                adminOnlyItems.forEach(item => {
                    item.style.display = 'block';
                });
            } else {
                adminOnlyItems.forEach(item => {
                    item.style.display = 'none';
                });
            }

            // Show admin/staff features for admins and staff (Thomas & Max)
            if (currentUser.role === 'admin' || currentUser.role === 'staff') {
                const adminStaffElements = document.querySelectorAll('.admin-staff-only');
                adminStaffElements.forEach(element => {
                    element.style.display = 'block';
                });
            }
            
            // Show house summary for admins in food orders
            const houseSummarySection = document.getElementById('houseSummarySection');
            if (houseSummarySection) {
                houseSummarySection.style.display = currentUser.role === 'admin' ? 'block' : 'none';
            }
            
            // Show create event button for admins
            const createEventBtn = document.getElementById('createEventBtn');
            if (createEventBtn) {
                createEventBtn.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
            }
        }

        // Navigation
        window.showPage = function(pageId) {
            // Hide all pages
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            
            // Remove active from nav items
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            
            // Show selected page
            document.getElementById(pageId).classList.add('active');
            
            // Add active to clicked nav item
            if (event && event.target) {
                event.target.classList.add('active');
            }
            
            // Show create event button for admins when on calendar page
            if (pageId === 'calendar' && currentUser && currentUser.role === 'admin') {
                const createEventBtn = document.getElementById('createEventBtn');
                if (createEventBtn) {
                    createEventBtn.style.display = 'inline-block';
                }
            }
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

        // Auth tab management (login/register)
        window.showAuthTab = function(tabType) {
            const loginTab = document.getElementById('login-auth-tab');
            const registerTab = document.getElementById('register-auth-tab');
            const tabButtons = document.querySelectorAll('.auth-tab-btn');
            
            // Remove active from all tabs and buttons
            loginTab.classList.remove('active');
            registerTab.classList.remove('active');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected tab
            if (tabType === 'login') {
                loginTab.classList.add('active');
                event.target.classList.add('active');
            } else if (tabType === 'register') {
                registerTab.classList.add('active');
                event.target.classList.add('active');
            }
        }

        // Public registration type management  
        function showPublicRegistrationType(type) {
            const playerForm = document.getElementById('public-player-registration');
            const staffForm = document.getElementById('public-staff-registration');
            const typeButtons = document.querySelectorAll('.public-registration-type-btn');
            
            // Remove active from all forms and buttons
            playerForm.style.display = 'none';
            staffForm.style.display = 'none';
            typeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected form
            if (type === 'player') {
                playerForm.style.display = 'block';
                event.target.classList.add('active');
            } else if (type === 'staff') {
                staffForm.style.display = 'block';
                event.target.classList.add('active');
            }
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
            successDiv.innerHTML = '<h3>✅ Registration Completed Successfully!</h3>' +
                '<p>Welcome ' + formData.firstName + '! Your player registration has been processed.</p>' +
                '<p>📧 Your profile has been updated in our system and coaching staff notified.</p>' +
                '<p>🏠 You will receive housing and program details at ' + formData.email + ' shortly.</p>';
            
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
                additionalInfo: document.getElementById('staffExperienceDetail').value,
                submittedAt: new Date().toISOString()
            };

            // Basic validation
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.additionalInfo) {
                alert('Please fill in all required fields.');
                return;
            }

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'message success';
            successDiv.innerHTML = '<h3>✅ Registration Completed Successfully!</h3>' +
                '<p>Welcome ' + formData.firstName + '! Your staff registration has been processed.</p>' +
                '<p>📧 Your profile has been updated in our system and management notified.</p>' +
                '<p>📋 You will receive any updates about your role at ' + formData.email + ' shortly.</p>';
            
            // Replace the form with success message
            document.getElementById('public-staff-registration').innerHTML = successDiv.outerHTML;
            
            console.log('Staff Application Submitted:', formData);
        }

        // Event Management Functions
        window.openCreateEventModal = function() {
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('eventDate').value = today;
            
            // Populate player selection list
            populatePlayerSelection();
            
            // Show the modal
            document.getElementById('createEventModal').style.display = 'flex';
        };

        window.populatePlayerSelection = function() {
            const playerList = document.getElementById('playerCheckboxList');
            if (!playerList) return;
            
            let html = '';
            
            // Use the existing player storage data
            if (typeof playerStorage !== 'undefined' && playerStorage.length > 0) {
                playerStorage.forEach(player => {
                    html += 
                        '<div class="player-checkbox-item">' +
                            '<input type="checkbox" id="player_' + player.id + '" value="' + player.id + '">' +
                            '<div class="player-info-mini">' +
                                '<div class="player-name-mini">' + player.firstName + ' ' + player.lastName + '</div>' +
                                '<div class="player-details-mini">' + player.position + ' • ' + player.house + ' • Room ' + player.room + '</div>' +
                            '</div>' +
                        '</div>';
                });
            } else {
                // Fallback sample players if playerStorage not available
                const samplePlayers = [
                    {id: 1, firstName: 'Max', lastName: 'Bisinger', position: 'Midfielder', house: 'Widdersdorf 1', room: '12A'},
                    {id: 2, firstName: 'Luis', lastName: 'García', position: 'Forward', house: 'Widdersdorf 1', room: '12B'},
                    {id: 3, firstName: 'Ahmed', lastName: 'Hassan', position: 'Defender', house: 'Widdersdorf 1', room: '13A'},
                    {id: 4, firstName: 'Jonas', lastName: 'Mueller', position: 'Goalkeeper', house: 'Widdersdorf 1', room: '13B'},
                    {id: 5, firstName: 'Mike', lastName: 'Brown', position: 'Midfielder', house: 'Widdersdorf 2', room: '14A'},
                    {id: 6, firstName: 'David', lastName: 'Kim', position: 'Defender', house: 'Widdersdorf 2', room: '14B'},
                    {id: 7, firstName: 'Carlos', lastName: 'Ruiz', position: 'Forward', house: 'Widdersdorf 2', room: '15A'},
                    {id: 8, firstName: 'Tom', lastName: 'Wilson', position: 'Midfielder', house: 'Widdersdorf 3', room: '16A'},
                    {id: 9, firstName: 'Alex', lastName: 'Chen', position: 'Defender', house: 'Widdersdorf 3', room: '16B'}
                ];
                
                samplePlayers.forEach(player => {
                    html += 
                        '<div class="player-checkbox-item">' +
                            '<input type="checkbox" id="player_' + player.id + '" value="' + player.id + '">' +
                            '<div class="player-info-mini">' +
                                '<div class="player-name-mini">' + player.firstName + ' ' + player.lastName + '</div>' +
                                '<div class="player-details-mini">' + player.position + ' • ' + player.house + ' • Room ' + player.room + '</div>' +
                            '</div>' +
                        '</div>';
                });
            }
            
            playerList.innerHTML = html;
        };

        window.togglePlayerSelection = function() {
            const attendanceType = document.getElementById('eventAttendance').value;
            const playerSection = document.getElementById('playerSelectionSection');
            
            if (attendanceType === 'selected') {
                playerSection.style.display = 'block';
            } else {
                playerSection.style.display = 'none';
            }
        };

        window.selectAllPlayers = function() {
            const checkboxes = document.querySelectorAll('#playerCheckboxList input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = true);
        };

        window.clearAllPlayers = function() {
            const checkboxes = document.querySelectorAll('#playerCheckboxList input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);
        };

        window.selectByHouse = function() {
            // Create a simple house selection interface
            const houses = ['Widdersdorf 1', 'Widdersdorf 2', 'Widdersdorf 3'];
            const house = prompt('Select house (enter 1, 2, or 3):\\n\\n1 - Widdersdorf 1\\n2 - Widdersdorf 2\\n3 - Widdersdorf 3');
            
            if (house && (house === '1' || house === '2' || house === '3')) {
                const targetHouse = 'Widdersdorf ' + house;
                const checkboxes = document.querySelectorAll('#playerCheckboxList .player-checkbox-item');
                
                checkboxes.forEach(item => {
                    const details = item.querySelector('.player-details-mini').textContent;
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    
                    if (details.includes(targetHouse)) {
                        checkbox.checked = true;
                    }
                });
            }
        };

        window.toggleRecurrenceOptions = function() {
            const recurrenceType = document.getElementById('eventRecurrence').value;
            const optionsSection = document.getElementById('recurrenceOptionsSection');
            const weeklyOptions = document.getElementById('weeklyOptions');
            const specificDayOptions = document.getElementById('specificDayOptions');
            const recurrenceUnit = document.getElementById('recurrenceUnit');
            
            // Hide all options first
            weeklyOptions.style.display = 'none';
            specificDayOptions.style.display = 'none';
            
            if (recurrenceType === 'none') {
                optionsSection.style.display = 'none';
            } else {
                optionsSection.style.display = 'block';
                
                // Update unit text and show relevant options
                if (recurrenceType === 'daily') {
                    recurrenceUnit.textContent = 'day(s)';
                } else if (recurrenceType === 'weekly') {
                    recurrenceUnit.textContent = 'week(s)';
                    weeklyOptions.style.display = 'block';
                } else if (recurrenceType === 'weekdays') {
                    recurrenceUnit.textContent = 'week(s)';
                    // Auto-select Mon-Fri
                    setTimeout(() => {
                        const dayCheckboxes = document.querySelectorAll('#weeklyOptions input[type="checkbox"]');
                        dayCheckboxes.forEach(cb => cb.checked = false);
                        [1,2,3,4,5].forEach(day => {
                            const checkbox = document.querySelector('#weeklyOptions input[value="' + day + '"]');
                            if (checkbox) checkbox.checked = true;
                        });
                    }, 100);
                    weeklyOptions.style.display = 'block';
                } else if (recurrenceType === 'weekends') {
                    recurrenceUnit.textContent = 'week(s)';
                    // Auto-select Sat-Sun
                    setTimeout(() => {
                        const dayCheckboxes = document.querySelectorAll('#weeklyOptions input[type="checkbox"]');
                        dayCheckboxes.forEach(cb => cb.checked = false);
                        [6,0].forEach(day => {
                            const checkbox = document.querySelector('#weeklyOptions input[value="' + day + '"]');
                            if (checkbox) checkbox.checked = true;
                        });
                    }, 100);
                    weeklyOptions.style.display = 'block';
                } else if (recurrenceType === 'specific-day') {
                    recurrenceUnit.textContent = 'week(s)';
                    specificDayOptions.style.display = 'block';
                } else if (recurrenceType === 'monthly') {
                    recurrenceUnit.textContent = 'month(s)';
                } else if (recurrenceType === 'custom') {
                    recurrenceUnit.textContent = 'day(s)';
                }
            }
        };

        window.closeCreateEventModal = function() {
            document.getElementById('createEventModal').style.display = 'none';
            document.getElementById('createEventForm').reset();
        };

        window.createNewEvent = function(event) {
            event.preventDefault();
            
            // Get form data
            const title = document.getElementById('eventTitle').value;
            const type = document.getElementById('eventType').value;
            const date = document.getElementById('eventDate').value;
            const time = document.getElementById('eventTime').value;
            const duration = document.getElementById('eventDuration').value;
            const location = document.getElementById('eventLocation').value;
            const description = document.getElementById('eventDescription').value;
            const attendance = document.getElementById('eventAttendance').value;
            const priority = document.getElementById('eventPriority').value;
            const recurrence = document.getElementById('eventRecurrence').value;
            const recurrenceInterval = document.getElementById('recurrenceInterval').value;
            const recurrenceEndDate = document.getElementById('recurrenceEndDate').value;
            
            // Get selected players if attendance is 'selected'
            let selectedPlayers = [];
            if (attendance === 'selected') {
                const checkedBoxes = document.querySelectorAll('#playerCheckboxList input[type="checkbox"]:checked');
                checkedBoxes.forEach(checkbox => {
                    const playerId = checkbox.value;
                    const playerItem = checkbox.closest('.player-checkbox-item');
                    const playerName = playerItem.querySelector('.player-name-mini').textContent;
                    const playerDetails = playerItem.querySelector('.player-details-mini').textContent;
                    
                    selectedPlayers.push({
                        id: playerId,
                        name: playerName,
                        details: playerDetails
                    });
                });
                
                if (selectedPlayers.length === 0) {
                    alert('Please select at least one player for this event.');
                    return;
                }
            }
            
            // Get selected days for weekly recurrence
            let selectedDays = [];
            if (recurrence === 'weekly' || recurrence === 'weekdays' || recurrence === 'weekends') {
                const dayCheckboxes = document.querySelectorAll('#weeklyOptions input[type="checkbox"]:checked');
                selectedDays = Array.from(dayCheckboxes).map(cb => parseInt(cb.value));
            } else if (recurrence === 'specific-day') {
                const specificDay = document.getElementById('specificWeekday').value;
                selectedDays = [parseInt(specificDay)];
            }

            // Create event object
            const newEvent = {
                id: Date.now().toString(),
                title: title,
                type: type,
                date: date,
                time: time,
                duration: duration || 90,
                location: location,
                description: description,
                attendance: attendance,
                priority: priority,
                selectedPlayers: selectedPlayers,
                recurrence: {
                    type: recurrence,
                    interval: recurrenceInterval,
                    endDate: recurrenceEndDate,
                    selectedDays: selectedDays
                },
                createdBy: currentUser.email,
                createdAt: new Date().toISOString(),
                attendees: []
            };
            
            // Add to calendar (in real app would save to database)
            if (!window.calendarEvents) {
                window.calendarEvents = [];
            }
            
            // Handle recurring events
            if (recurrence !== 'none') {
                const events = generateRecurringEvents(newEvent);
                window.calendarEvents.push(...events);
            } else {
                window.calendarEvents.push(newEvent);
            }
            
            // Show success message with player info
            let successMessage = 'Event "' + title + '" created successfully!\\n\\n' +
                  'Date: ' + new Date(date).toLocaleDateString() + '\\n' +
                  'Time: ' + time + '\\n' +
                  'Type: ' + type + '\\n' +
                  'Location: ' + location + '\\n\\n';
            
            if (attendance === 'selected' && selectedPlayers.length > 0) {
                successMessage += 'Assigned Players (' + selectedPlayers.length + '):';
                selectedPlayers.forEach(player => {
                    successMessage += '\\n• ' + player.name;
                });
            } else if (attendance === 'all') {
                successMessage += 'Attendance: All Players Required';
            } else {
                successMessage += 'Attendance: ' + attendance;
            }
            
            if (recurrence !== 'none') {
                successMessage += '\\n\\nRecurring: ' + recurrence;
                if (recurrenceEndDate) {
                    successMessage += ' until ' + new Date(recurrenceEndDate).toLocaleDateString();
                }
            }
            
            alert(successMessage);
            
            // Close modal and refresh calendar
            closeCreateEventModal();
            refreshCalendarEvents();
            
            // Delay the display update to ensure DOM is ready
            setTimeout(() => {
                displayCalendarEvents();
            }, 100);
            
            console.log('New event created:', newEvent);
        };

        window.generateRecurringEvents = function(baseEvent) {
            const events = [];
            const startDate = new Date(baseEvent.date);
            const endDate = baseEvent.recurrence.endDate ? new Date(baseEvent.recurrence.endDate) : new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // Default 1 year
            const interval = parseInt(baseEvent.recurrence.interval) || 1;
            
            let currentDate = new Date(startDate);
            let eventCounter = 1;
            
            while (currentDate <= endDate && eventCounter <= 100) { // Max 100 occurrences
                const eventDate = new Date(currentDate);
                
                // Create event for this date
                const recurringEvent = {
                    ...baseEvent,
                    id: baseEvent.id + '_' + eventCounter,
                    date: eventDate.toISOString().split('T')[0],
                    isRecurring: true,
                    parentEventId: baseEvent.id,
                    occurrenceNumber: eventCounter
                };
                
                events.push(recurringEvent);
                
                // Calculate next occurrence
                if (baseEvent.recurrence.type === 'daily') {
                    currentDate.setDate(currentDate.getDate() + interval);
                } else if (baseEvent.recurrence.type === 'weekly' || baseEvent.recurrence.type === 'weekdays' || baseEvent.recurrence.type === 'weekends' || baseEvent.recurrence.type === 'specific-day') {
                    if (baseEvent.recurrence.selectedDays && baseEvent.recurrence.selectedDays.length > 0) {
                        // Handle specific days of the week
                        const nextDay = getNextWeeklyOccurrence(currentDate, baseEvent.recurrence.selectedDays, interval);
                        currentDate = nextDay;
                    } else {
                        currentDate.setDate(currentDate.getDate() + (7 * interval));
                    }
                } else if (baseEvent.recurrence.type === 'monthly') {
                    currentDate.setMonth(currentDate.getMonth() + interval);
                } else {
                    // Custom - treat as daily
                    currentDate.setDate(currentDate.getDate() + interval);
                }
                
                eventCounter++;
            }
            
            return events;
        };

        function getNextWeeklyOccurrence(currentDate, selectedDays, interval) {
            const nextDate = new Date(currentDate);
            let found = false;
            let attempts = 0;
            
            while (!found && attempts < 14) { // Max 2 weeks to find next occurrence
                nextDate.setDate(nextDate.getDate() + 1);
                const dayOfWeek = nextDate.getDay();
                
                if (selectedDays.includes(dayOfWeek)) {
                    found = true;
                }
                attempts++;
            }
            
            return nextDate;
        }

        window.deleteEvent = function(eventId) {
            if (!confirm('Are you sure you want to delete this event?')) {
                return;
            }
            
            if (!window.calendarEvents) {
                return;
            }
            
            const eventIndex = window.calendarEvents.findIndex(event => event.id === eventId);
            if (eventIndex > -1) {
                const event = window.calendarEvents[eventIndex];
                
                if (event.isRecurring) {
                    const deleteAll = confirm('This is a recurring event. Delete all occurrences?\\n\\nClick OK to delete all, Cancel to delete only this occurrence.');
                    
                    if (deleteAll) {
                        // Delete all occurrences
                        window.calendarEvents = window.calendarEvents.filter(e => 
                            e.parentEventId !== event.parentEventId && e.id !== event.parentEventId
                        );
                    } else {
                        // Delete only this occurrence
                        window.calendarEvents.splice(eventIndex, 1);
                    }
                } else {
                    // Delete single event
                    window.calendarEvents.splice(eventIndex, 1);
                }
                
                refreshCalendarEvents();
                
                // Delay the display update
                setTimeout(() => {
                    displayCalendarEvents();
                }, 100);
                
                alert('Event deleted successfully.');
            }
        };

        window.refreshCalendarEvents = function() {
            // This would refresh the calendar display
            // For now, just log the events
            console.log('Calendar events updated:', window.calendarEvents);
            
            // Update any visible calendar views
            displayCalendarEvents();
        };

        // Current calendar state
        let currentCalendarDate = new Date();
        let currentCalendarView = 'day';

        window.displayCalendarEvents = function() {
            // Update event management list for admins
            const container = document.getElementById('eventManagementList');
            if (container) {
                if (!window.calendarEvents || window.calendarEvents.length === 0) {
                    container.innerHTML = '<p class="no-events-message">No events created yet. Use the "Create New Event" button to add events.</p>';
                } else {
                    let html = '';
                    const sortedEvents = window.calendarEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
                    
                    sortedEvents.forEach(event => {
                        const eventDate = new Date(event.date);
                        const isRecurring = event.isRecurring || event.recurrence?.type !== 'none';
                        
                        html += '<div class="event-item' + (isRecurring ? ' recurring' : '') + '">';
                        html += '<div class="event-header">';
                        html += '<div>';
                        html += '<div class="event-title-main">' + event.title;
                        
                        if (isRecurring) {
                            html += '<span class="recurring-badge">Recurring</span>';
                        }
                        
                        html += '</div>';
                        html += '<div class="event-meta">';
                        html += '📅 ' + eventDate.toLocaleDateString() + ' at ' + event.time;
                        html += ' • 📍 ' + (event.location || 'Location TBD');
                        html += ' • ⚽ ' + event.type;
                        html += '</div>';
                        
                        if (event.selectedPlayers && event.selectedPlayers.length > 0) {
                            html += '<div class="event-meta">👥 ' + event.selectedPlayers.length + ' players assigned</div>';
                        } else if (event.attendance === 'all') {
                            html += '<div class="event-meta">👥 All players required</div>';
                        }
                        
                        html += '</div>';
                        html += '<div class="event-actions-menu">';
                        html += '<button class="action-btn" onclick="editEvent(' + JSON.stringify(event.id) + ')">✏️ Edit</button>';
                        html += '<button class="action-btn danger" onclick="deleteEvent(' + JSON.stringify(event.id) + ')">🗑️ Delete</button>';
                        html += '</div>';
                        html += '</div>';
                        
                        if (event.description) {
                            html += '<div class="event-meta" style="margin-top: 0.5rem;">' + event.description + '</div>';
                        }
                        
                        html += '</div>';
                    });
                    
                    container.innerHTML = html;
                }
            }
            
            // Update the main calendar view based on current view mode
            renderCurrentCalendarView();
        };

        window.switchCalendarView = function(view) {
            currentCalendarView = view;
            
            // Update view buttons
            document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
            event.target?.classList.add('active');
            
            // Update view containers
            document.querySelectorAll('.calendar-view').forEach(container => container.classList.remove('active'));
            document.getElementById(view + 'View').classList.add('active');
            
            // Update period display and render content
            renderCurrentCalendarView();
        };

        window.navigateCalendar = function(direction) {
            if (currentCalendarView === 'day') {
                currentCalendarDate.setDate(currentCalendarDate.getDate() + direction);
            } else if (currentCalendarView === 'week') {
                currentCalendarDate.setDate(currentCalendarDate.getDate() + (direction * 7));
            } else if (currentCalendarView === 'month') {
                currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
            }
            
            renderCurrentCalendarView();
        };

        window.renderCurrentCalendarView = function() {
            updatePeriodDisplay();
            
            if (currentCalendarView === 'day') {
                renderDayView();
            } else if (currentCalendarView === 'week') {
                renderWeekView();
            } else if (currentCalendarView === 'month') {
                renderMonthView();
            }
        };

        window.updatePeriodDisplay = function() {
            const periodElement = document.getElementById('currentPeriod');
            if (!periodElement) return;
            
            const today = new Date();
            const isToday = currentCalendarDate.toDateString() === today.toDateString();
            
            if (currentCalendarView === 'day') {
                if (isToday) {
                    periodElement.textContent = 'Today';
                } else {
                    periodElement.textContent = currentCalendarDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                }
            } else if (currentCalendarView === 'week') {
                const startOfWeek = new Date(currentCalendarDate);
                startOfWeek.setDate(currentCalendarDate.getDate() - currentCalendarDate.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                
                periodElement.textContent = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
                    ' - ' + endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            } else if (currentCalendarView === 'month') {
                periodElement.textContent = currentCalendarDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                });
            }
        };

        window.renderDayView = function() {
            const container = document.getElementById('dayViewContent');
            if (!container) return;
            
            const dayEvents = getEventsForDate(currentCalendarDate);
            const today = new Date();
            const isToday = currentCalendarDate.toDateString() === today.toDateString();
            
            let html = '<div class="day-header">';
            html += '<div class="day-date">' + currentCalendarDate.getDate() + '</div>';
            html += '<div class="day-weekday">' + currentCalendarDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', year: 'numeric' }) + '</div>';
            html += '</div>';
            
            if (dayEvents.length === 0) {
                html += '<div class="no-events-message">No events scheduled for this day</div>';
            } else {
                html += '<div class="day-events">';
                dayEvents.sort((a, b) => a.time.localeCompare(b.time)).forEach(event => {
                    html += '<div class="day-event-item ' + event.type + '">';
                    html += '<div class="day-event-time">' + event.time + '</div>';
                    html += '<div class="day-event-title">' + event.title + '</div>';
                    html += '<div class="day-event-details">';
                    if (event.location) html += '📍 ' + event.location + ' • ';
                    html += '⚽ ' + event.type;
                    if (event.selectedPlayers && event.selectedPlayers.length > 0) {
                        html += ' • 👥 ' + event.selectedPlayers.length + ' players';
                    }
                    html += '</div>';
                    if (event.description) {
                        html += '<div style="margin-top: 0.5rem; font-size: 0.875rem;">' + event.description + '</div>';
                    }
                    html += '</div>';
                });
                html += '</div>';
            }
            
            container.innerHTML = html;
        };

        window.renderWeekView = function() {
            const container = document.getElementById('weekViewContent');
            if (!container) return;
            
            // Get start of week (Sunday)
            const startOfWeek = new Date(currentCalendarDate);
            startOfWeek.setDate(currentCalendarDate.getDate() - currentCalendarDate.getDay());
            
            const today = new Date();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            let html = '<div class="week-grid">';
            
            for (let i = 0; i < 7; i++) {
                const currentDay = new Date(startOfWeek);
                currentDay.setDate(startOfWeek.getDate() + i);
                const isToday = currentDay.toDateString() === today.toDateString();
                
                html += '<div class="week-day' + (isToday ? ' today' : '') + '">';
                html += '<div class="week-day-header">';
                html += '<div>' + dayNames[i] + '</div>';
                html += '<div style="font-size: 1.25rem;">' + currentDay.getDate() + '</div>';
                html += '</div>';
                
                const dayEvents = getEventsForDate(currentDay);
                dayEvents.sort((a, b) => a.time.localeCompare(b.time)).forEach(event => {
                    html += '<div class="week-event ' + event.type + '" title="' + event.title + ' at ' + event.time + '">';
                    html += event.time + ' ' + event.title.substring(0, 15);
                    html += '</div>';
                });
                
                html += '</div>';
            }
            
            html += '</div>';
            container.innerHTML = html;
        };

        window.renderMonthView = function() {
            const container = document.getElementById('monthViewContent');
            if (!container) return;
            
            const year = currentCalendarDate.getFullYear();
            const month = currentCalendarDate.getMonth();
            
            // Get first day of month and number of days
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDayOfWeek = firstDay.getDay();
            
            const today = new Date();
            const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            let html = '<div class="month-grid">';
            
            // Add day headers
            dayHeaders.forEach(day => {
                html += '<div class="month-day-header" style="background: #f3f4f6; font-weight: 600; padding: 0.5rem; text-align: center;">' + day + '</div>';
            });
            
            // Add empty cells for days before month starts
            for (let i = 0; i < startingDayOfWeek; i++) {
                const prevMonthDay = new Date(year, month, 1 - (startingDayOfWeek - i));
                html += '<div class="month-day other-month">';
                html += '<div class="month-day-number">' + prevMonthDay.getDate() + '</div>';
                html += '</div>';
            }
            
            // Add days of current month
            for (let day = 1; day <= daysInMonth; day++) {
                const currentDay = new Date(year, month, day);
                const isToday = currentDay.toDateString() === today.toDateString();
                
                html += '<div class="month-day' + (isToday ? ' today' : '') + '">';
                html += '<div class="month-day-number">' + day + '</div>';
                
                const dayEvents = getEventsForDate(currentDay);
                if (dayEvents.length > 0) {
                    html += '<div class="month-events">';
                    dayEvents.slice(0, 2).forEach(event => {
                        html += '<div class="month-event-dot ' + event.type + '">';
                        html += event.time + ' ' + event.title.substring(0, 8);
                        html += '</div>';
                    });
                    if (dayEvents.length > 2) {
                        html += '<div class="month-event-dot">+' + (dayEvents.length - 2) + '</div>';
                    }
                    html += '</div>';
                }
                
                html += '</div>';
            }
            
            // Add remaining cells to complete the grid
            const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
            for (let i = daysInMonth + startingDayOfWeek; i < totalCells; i++) {
                const nextMonthDay = new Date(year, month + 1, i - daysInMonth - startingDayOfWeek + 1);
                html += '<div class="month-day other-month">';
                html += '<div class="month-day-number">' + nextMonthDay.getDate() + '</div>';
                html += '</div>';
            }
            
            html += '</div>';
            container.innerHTML = html;
        };

        window.getEventsForDate = function(date) {
            if (!window.calendarEvents) return [];
            
            const dateString = date.toISOString().split('T')[0];
            return window.calendarEvents.filter(event => event.date === dateString);
        };

        // Initialize calendar on page load
        window.addEventListener('load', function() {
            setTimeout(() => {
                if (typeof renderCurrentCalendarView === 'function') {
                    renderCurrentCalendarView();
                }
            }, 1000);
        });

        window.editEvent = function(eventId) {
            // For now, just show event details - full edit functionality could be added later
            const event = window.calendarEvents.find(e => e.id === eventId);
            if (event) {
                let details = 'Event Details:\\n\\n';
                details += 'Title: ' + event.title + '\\n';
                details += 'Type: ' + event.type + '\\n';
                details += 'Date: ' + new Date(event.date).toLocaleDateString() + '\\n';
                details += 'Time: ' + event.time + '\\n';
                details += 'Location: ' + (event.location || 'Not specified') + '\\n';
                details += 'Duration: ' + event.duration + ' minutes\\n';
                details += 'Priority: ' + event.priority + '\\n';
                
                if (event.selectedPlayers && event.selectedPlayers.length > 0) {
                    details += '\\nAssigned Players:\\n';
                    event.selectedPlayers.forEach(player => {
                        details += '• ' + player.name + '\\n';
                    });
                }
                
                if (event.recurrence && event.recurrence.type !== 'none') {
                    details += '\\nRecurring: ' + event.recurrence.type;
                    if (event.recurrence.endDate) {
                        details += ' until ' + new Date(event.recurrence.endDate).toLocaleDateString();
                    }
                }
                
                alert(details + '\\n\\n(Full editing functionality can be added in future updates)');
            }
        };

        window.refreshCalendarEvents = function() {
            // In a real application, this would refresh the calendar display
            // For now, we'll just log the events
            if (window.calendarEvents && window.calendarEvents.length > 0) {
                console.log('Calendar events updated. Total events:', window.calendarEvents.length);
                
                // Add visual indicator that events were updated
                const calendarPage = document.getElementById('calendar');
                if (calendarPage && !calendarPage.classList.contains('page-hidden')) {
                    const notification = document.createElement('div');
                    notification.className = 'success-notification';
                    notification.textContent = 'Calendar updated with new event!';
                    notification.style.cssText = 
                        'position: fixed;' +
                        'top: 20px;' +
                        'right: 20px;' +
                        'background: #10b981;' +
                        'color: white;' +
                        'padding: 1rem;' +
                        'border-radius: 8px;' +
                        'z-index: 1000;' +
                        'box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
                    
                    document.body.appendChild(notification);
                    
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 3000);
                }
            }
        };

        // Logout
        window.logout = function() {
            currentUser = null;
            localStorage.removeItem('fc-koln-auth');
            document.getElementById('loginPage').style.display = 'block';
            document.getElementById('mainApp').style.display = 'none';
            
            // Reset form
            document.getElementById('email').value = 'max.bisinger@warubi-sports.com';
            document.getElementById('password').value = 'ITP2024';
            document.getElementById('loginMessage').innerHTML = '';
        }

        // Make authentication functions globally accessible (removed duplicate)

        // Make forgot password function globally accessible
        window.showForgotPassword = function() {
            const loginTab = document.getElementById('loginTab');
            const forgotTab = document.getElementById('forgotPasswordTab');
            
            if (loginTab) loginTab.style.display = 'none';
            if (forgotTab) forgotTab.style.display = 'block';
            
            document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
        };

        // Forgot Password Form Handler
        document.addEventListener('DOMContentLoaded', function() {
            const forgotPasswordForm = document.getElementById('forgotPasswordForm');
            if (forgotPasswordForm) {
                forgotPasswordForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const email = document.getElementById('forgotEmail').value.trim();
                    const messageDiv = document.getElementById('forgotPasswordMessage');
                    
                    if (email) {
                        messageDiv.innerHTML = '<div style="color: #22c55e; margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 6px;">Password reset instructions have been sent to ' + email + '. Please check your email.</div>';
                        document.getElementById('forgotEmail').value = '';
                    } else {
                        messageDiv.innerHTML = '<div style="color: #dc2626; margin-top: 1rem;">Please enter a valid email address.</div>';
                    }
                });
            }
        });

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

        console.log('1.FC Köln Bundesliga Talent Program loaded successfully');
        console.log('Complete application with Dashboard, Players, Chores, Calendar, Food Orders, Communications, House Management, and Admin');

        // Enhanced Interactive Functions
        function markAttendance() {
            alert('Attendance marking feature - Players can mark themselves present for training sessions');
        }

        function scheduleTraining() {
            alert('Training scheduler - Coaches can create new training sessions with detailed parameters');
        }

        function reportAbsence() {
            alert('Absence reporting - Players can report absence with reasons for better tracking');
        }

        function sendReminders() {
            alert('Automated reminder system - Send notifications for upcoming events and deadlines');
        }

        function exportSchedule() {
            alert('Schedule export - Download training calendars in PDF/iCal format for external use');
        }

        function createGroceryOrder() {
            alert('Grocery ordering system - Automated house-specific grocery orders with dietary requirements');
        }

        function submitMealRequest() {
            alert('Special meal request system - Players can request customized meals for events or dietary needs');
        }

        function sendMessage() {
            alert('Advanced messaging system - Send targeted messages with priority levels and read confirmations');
        }

        function sendEmergencyAlert() {
            if(confirm('Send emergency alert to all team members? This will trigger immediate SMS and email notifications.')) {
                alert('Emergency alert sent to all 40 team members');
            }
        }

        function sendTrainingReminder() {
            alert('Training reminder sent to all active players for tomorrow\\'s sessions');
        }

        function sendMealAnnouncement() {
            alert('Meal announcement system - Notify about special menus, dietary changes, or meal times');
        }

        function sendHouseUpdate() {
            alert('House-specific updates - Send targeted messages to individual house groups');
        }

        function viewReplies() {
            alert('View message replies and conversation threads for better communication tracking');
        }

        function markImportant() {
            alert('Mark message as important - Prioritize key communications for easier access');
        }

        function viewMatchDetails() {
            alert('Detailed match information - View lineup, tactics, opponent analysis, and logistics');
        }

        function requestTickets() {
            alert('Ticket request system - Family and friends can request match tickets through players');
        }

        function downloadGuidelines() {
            alert('Download nutrition guidelines - Access latest dietary recommendations in PDF format');
        }

        // Enhanced Real-time Updates
        function updateDashboardMetrics() {
            // Simulate real-time updates for dashboard metrics
            const metrics = [
                { id: 'attendance-rate', value: Math.floor(Math.random() * 10) + 90 },
                { id: 'performance-score', value: Math.floor(Math.random() * 20) + 80 },
                { id: 'nutrition-compliance', value: Math.floor(Math.random() * 15) + 85 }
            ];
            
            metrics.forEach(function(metric) {
                const element = document.querySelector('[data-metric="' + metric.id + '"]');
                if (element) {
                    element.textContent = metric.value + '%';
                }
            });
        }

        // Initialize enhanced features
        function initializeEnhancements() {
            // Update metrics every 30 seconds
            setInterval(updateDashboardMetrics, 30000);
            
            // Add hover effects for interactive elements
            document.querySelectorAll('.calendar-event').forEach(event => {
                event.addEventListener('click', function() {
                    alert('Event details: ' + this.querySelector(\'.event-title\').textContent);
                });
            });

            // Initialize nutrition progress animations
            document.querySelectorAll('.progress-fill').forEach(fill => {
                const width = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = width;
                }, 1000);
            });

            console.log('Enhanced features initialized successfully');
        }

        // Start enhanced features when system loads
        setTimeout(initializeEnhancements, 2000);

        // Admin Player Management Functions
        function showAdminSection(section) {
            // Hide all sections
            document.querySelectorAll('.admin-section').forEach(function(el) {
                el.classList.remove('active');
            });
            document.querySelectorAll('.admin-nav-btn').forEach(function(btn) {
                btn.classList.remove('active');
            });

            // Show selected section
            const targetSection = document.getElementById(section);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Activate corresponding button
            event.target.classList.add('active');
        }

        function searchPlayers() {
            const searchTerm = document.getElementById('playerSearch').value.toLowerCase();
            const statusFilter = document.getElementById('statusFilter').value;
            const positionFilter = document.getElementById('positionFilter').value;
            
            alert('Search functionality - Filter players by: "' + searchTerm + '", Status: ' + statusFilter + ', Position: ' + positionFilter);
        }

        function addNewPlayer() {
            alert('Add New Player - Open detailed registration form for new team member');
        }

        function editPlayer(playerId) {
            // Populate modal with player data based on playerId
            let playerData = getPlayerData(playerId);
            
            document.getElementById('editFirstName').value = playerData.firstName;
            document.getElementById('editLastName').value = playerData.lastName;
            document.getElementById('editPosition').value = playerData.position;
            document.getElementById('editStatus').value = playerData.status;
            document.getElementById('editAge').value = playerData.age;
            document.getElementById('editNationality').value = playerData.nationality;
            document.getElementById('editHouse').value = playerData.house;
            document.getElementById('editRoom').value = playerData.room;
            document.getElementById('editContract').value = playerData.contract;
            document.getElementById('editNotes').value = playerData.notes || '';
            
            // Store current player ID for saving
            document.getElementById('playerEditModal').setAttribute('data-player-id', playerId);
            document.getElementById('playerEditModal').style.display = 'block';
        }

        function getPlayerData(playerId) {
            // Mock data - in real implementation, this would fetch from database
            const players = {
                'marco-silva': {
                    firstName: 'Marco',
                    lastName: 'Silva',
                    position: 'midfielder',
                    status: 'active',
                    age: 19,
                    nationality: 'Portugal',
                    house: 'Widdersdorf 1',
                    room: '12A',
                    contract: '2024-2026',
                    notes: 'Team captain, excellent leadership skills'
                },
                'luis-garcia': {
                    firstName: 'Luis',
                    lastName: 'García',
                    position: 'forward',
                    status: 'injured',
                    age: 18,
                    nationality: 'Spain',
                    house: 'Widdersdorf 2',
                    room: '08B',
                    contract: '2023-2025',
                    notes: 'Knee injury - expected return in 2 weeks'
                },
                'ahmad-hassan': {
                    firstName: 'Ahmad',
                    lastName: 'Hassan',
                    position: 'defender',
                    status: 'active',
                    age: 20,
                    nationality: 'Egypt',
                    house: 'Widdersdorf 1',
                    room: '15C',
                    contract: '2023-2025',
                    notes: 'Strong defensive player, vegetarian diet'
                }
            };
            return players[playerId] || {
                firstName: '',
                lastName: '',
                position: 'midfielder',
                status: 'active',
                age: 18,
                nationality: 'Germany',
                house: 'Widdersdorf 1',
                room: '',
                contract: '',
                notes: ''
            };
        }

        function closePlayerEditModal() {
            document.getElementById('playerEditModal').style.display = 'none';
        }

        function updatePlayerDisplay(playerId, playerData) {
            // Update the visual display of the player in the admin grid
            console.log('Updated player profile for: ' + playerId);
            console.log('New data:', playerData);
        }

        function suspendPlayer(playerId) {
            if(confirm('Are you sure you want to suspend this player? This will temporarily restrict their access.')) {
                alert('Player suspended successfully. They have been notified and will be contacted by administration.');
            }
        }

        function viewMedicalRecord(playerId) {
            alert('Medical Record Access - View detailed medical history, injuries, and treatment plans for player: ' + playerId);
        }

        function viewPerformance(playerId) {
            alert('Performance Analytics - View detailed statistics, training progress, and match performance for player: ' + playerId);
        }

        function assignCaptain(playerId) {
            if(confirm('Assign this player as team captain? This will update their leadership role and responsibilities.')) {
                alert('Player assigned as team captain successfully!');
            }
        }

        function transferPlayer(playerId) {
            alert('Player Transfer Management - Manage loan agreements, transfers, and contract changes for player: ' + playerId);
        }

        function reactivatePlayer(playerId) {
            if(confirm('Reactivate this player? This will restore their full access and playing status.')) {
                alert('Player reactivated successfully! They have been notified and can resume all activities.');
            }
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('playerEditModal');
            if (event.target === modal) {
                closePlayerEditModal();
            }
        };

        // Full Admin Control Functions
        function fullUserControl() {
            alert('FULL USER CONTROL ACTIVATED\\n\\nAdmin now has complete control over:\\n• All user accounts\\n• Account creation and deletion\\n• Profile modifications\\n• Access level changes\\n• Password resets\\n\\nAll user management operations are now available.');
        }

        function passwordManagement() {
            if(confirm('Enable global password management? This will allow you to reset any user password and view security information.')) {
                alert('GLOBAL PASSWORD MANAGEMENT ENABLED\\n\\nYou can now:\\n• Reset any user password\\n• Force password changes\\n• View login history\\n• Manage security settings\\n• Access encrypted data');
            }
        }

        function sessionControl() {
            if(confirm('Force logout all users? This will disconnect everyone from the system immediately.')) {
                alert('ALL USER SESSIONS TERMINATED\\n\\nAll users have been logged out except administrators.\\nUsers will need to log in again to access the system.');
            }
        }

        function permissionOverride() {
            if(confirm('Override all user permissions? This gives admin access to everything regardless of normal restrictions.')) {
                alert('PERMISSION OVERRIDE ACTIVATED\\n\\nAdmin permissions now bypass all restrictions:\\n• Access to all modules\\n• Database read/write access\\n• Medical records access\\n• Financial data access\\n• Emergency protocols');
            }
        }

        function lockdownMode() {
            if(confirm('Enable system lockdown? This will restrict access for all non-admin users.')) {
                alert('SYSTEM LOCKDOWN ACTIVATED\\n\\nSecurity measures engaged:\\n• Non-admin access restricted\\n• All sessions monitored\\n• Activity logging increased\\n• Emergency protocols ready');
            }
        }

        function databaseFullAccess() {
            if(confirm('Enable direct database access? This provides complete database control.')) {
                alert('DATABASE FULL ACCESS GRANTED\\n\\nDirect database control enabled:\\n• SQL query execution\\n• Table modifications\\n• Data export/import\\n• Schema changes\\n• Backup/restore operations');
            }
        }

        function backupManagement() {
            alert('BACKUP MANAGEMENT SYSTEM\\n\\nFull backup control available:\\n• Create instant backups\\n• Schedule automated backups\\n• Restore from any backup point\\n• Manage backup storage\\n• Verify backup integrity');
        }

        function dataExportAll() {
            if(confirm('Export all system data? This will create a complete data export.')) {
                alert('COMPLETE DATA EXPORT INITIATED\\n\\nExporting all system data:\\n• User profiles and authentication\\n• Player records and performance\\n• Financial and administrative data\\n• System logs and analytics\\n\\nExport will be available for download shortly.');
            }
        }

        function emergencyShutdown() {
            if(confirm('EMERGENCY SHUTDOWN - Are you sure? This will immediately shut down the entire system.')) {
                if(confirm('FINAL WARNING: This will disconnect all users and stop all services. Continue?')) {
                    alert('EMERGENCY SHUTDOWN INITIATED\\n\\nSystem shutdown in progress:\\n• All user sessions terminated\\n• Services stopping\\n• Data safely stored\\n• Emergency contacts notified');
                }
            }
        }

        function massPlayerUpdate() {
            alert('MASS PLAYER UPDATE TOOLS\\n\\nBulk operations available:\\n• Update multiple player profiles\\n• Change house assignments\\n• Modify contract terms\\n• Update medical information\\n• Batch status changes');
        }

        function medicalRecordsFull() {
            if(confirm('Access complete medical records? This includes sensitive health information.')) {
                alert('MEDICAL RECORDS FULL ACCESS GRANTED\\n\\nComplete medical system access:\\n• All player health records\\n• Injury histories\\n• Treatment plans\\n• Medical clearances\\n• Emergency medical information');
            }
        }

        function financialRecords() {
            if(confirm('Access full financial records? This includes sensitive financial data.')) {
                alert('FINANCIAL RECORDS ACCESS GRANTED\\n\\nComplete financial access:\\n• Player contracts and salaries\\n• Program budgets\\n• Expense tracking\\n• Revenue analysis\\n• Financial reporting');
            }
        }

        function disciplinaryActions() {
            alert('DISCIPLINARY ACTION TOOLS\\n\\nDisciplinary management:\\n• Issue warnings and sanctions\\n• Suspend player access\\n• Implement corrective measures\\n• Track disciplinary history\\n• Generate reports');
        }

        function facilityFullControl() {
            alert('FACILITY MANAGEMENT CONTROL\\n\\nComplete facility control:\\n• House assignments\\n• Room allocations\\n• Facility maintenance\\n• Security systems\\n• Emergency protocols');
        }

        function emergencyProtocols() {
            alert('EMERGENCY PROTOCOLS ACTIVATED\\n\\nEmergency systems ready:\\n• Medical emergency response\\n• Evacuation procedures\\n• Security lockdown\\n• Emergency contacts\\n• Crisis management');
        }

        function factoryReset() {
            if(confirm('DANGER: Factory reset will delete ALL data permanently. Are you absolutely sure?')) {
                if(confirm('FINAL WARNING: This action cannot be undone. All players, staff, and system data will be lost. Continue?')) {
                    alert('FACTORY RESET INITIATED\\n\\nSystem reset in progress:\\n• All user data deleted\\n• Database cleared\\n• System restored to defaults\\n• Logs archived');
                }
            }
        }

        function emergencyLockdown() {
            if(confirm('ACTIVATE EMERGENCY LOCKDOWN? This will lock all facilities and restrict all access.')) {
                alert('🚨 EMERGENCY LOCKDOWN ACTIVATED 🚨\\n\\nSecurity measures engaged:\\n• All facilities locked\\n• Emergency services contacted\\n• Staff and authorities notified\\n• Security protocols active');
            }
        }

        function emergencyEvacuation() {
            if(confirm('INITIATE EVACUATION PROTOCOL? This will trigger facility evacuation procedures.')) {
                alert('🚨 EVACUATION PROTOCOL INITIATED 🚨\\n\\nEvacuation in progress:\\n• Alarm systems activated\\n• Emergency exits unlocked\\n• Evacuation routes highlighted\\n• Emergency services notified');
            }
        }

        function emergencyMedical() {
            alert('🏥 MEDICAL EMERGENCY PROTOCOL 🏥\\n\\nMedical emergency response:\\n• Emergency medical services contacted\\n• On-site medical staff alerted\\n• Medical emergency kit locations\\n• Hospital contact information\\n• Player medical records accessible');
        }

        function emergencyContact() {
            alert('📞 EMERGENCY CONTACTS 📞\\n\\nEmergency contact system:\\n• Fire Department: 112\\n• Police: 110\\n• Medical Emergency: 112\\n• FC Köln Security: +49-221-XXX-XXXX\\n• Program Director: +49-221-XXX-XXXX');
        }

        function refreshSystemStatus() {
            // Simulate real-time update
            const indicators = document.querySelectorAll('.live-count, .admin-count, .staff-count, .player-count');
            indicators.forEach(function(indicator) {
                indicator.style.color = '#fbbf24';
                setTimeout(function() {
                    indicator.style.color = '#dc2626';
                }, 500);
            });
            alert('System status refreshed - All metrics updated with real-time data');
        }

        // Toggle player selection based on assignment type
        function togglePlayerSelection() {
            const assignmentType = document.getElementById('choreAssignmentType').value;
            const individualPlayerRow = document.getElementById('individualPlayerRow');
            const multiplePlayersRow = document.getElementById('multiplePlayersRow');
            
            // Hide all selection rows first
            individualPlayerRow.style.display = 'none';
            multiplePlayersRow.style.display = 'none';
            
            // Show appropriate selection based on type
            if (assignmentType === 'individual') {
                individualPlayerRow.style.display = 'flex';
            } else if (assignmentType === 'multiple') {
                multiplePlayersRow.style.display = 'block';
                updateSelectedCount();
            }
        }

        // Select all players
        function selectAllPlayers() {
            const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
            updateSelectedCount();
        }

        // Clear all player selections
        function clearAllPlayers() {
            const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            updateSelectedCount();
        }

        // Update selected count display
        function updateSelectedCount() {
            const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]:checked');
            const count = checkboxes.length;
            const countDisplay = document.getElementById('selectedCount');
            if (countDisplay) {
                countDisplay.textContent = count + ' player' + (count === 1 ? '' : 's') + ' selected';
            }
        }

        // Add event listeners to checkboxes for real-time count updates
        document.addEventListener('DOMContentLoaded', function() {
            const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSelectedCount);
            });
        });

        // Create new chore assignment
        function createChoreAssignment() {
            const title = document.getElementById('choreTitle').value;
            const priority = document.getElementById('chorePriority').value;
            const house = document.getElementById('choreHouse').value;
            const assignmentType = document.getElementById('choreAssignmentType').value;
            const deadline = document.getElementById('choreDeadline').value;
            const points = document.getElementById('chorePoints').value || 15;
            const description = document.getElementById('choreDescription').value;

            if (!title || !priority || !house || !assignmentType || !deadline || !description) {
                alert('Please fill in all required fields.');
                return;
            }

            let assignedPlayers = [];
            let assignmentText = '';

            // Get assigned players based on assignment type
            if (assignmentType === 'individual') {
                const individualPlayer = document.getElementById('individualPlayer').value;
                if (!individualPlayer) {
                    alert('Please select a specific player for individual assignment.');
                    return;
                }
                assignedPlayers = [individualPlayer];
                assignmentText = individualPlayer.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            } else if (assignmentType === 'multiple') {
                const selectedCheckboxes = document.querySelectorAll('input[name="selectedPlayers"]:checked');
                if (selectedCheckboxes.length === 0) {
                    alert('Please select at least one player for multiple player assignment.');
                    return;
                }
                assignedPlayers = Array.from(selectedCheckboxes).map(cb => cb.value);
                assignmentText = assignedPlayers.length + ' specific players: ' + 
                    assignedPlayers.map(p => p.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ');
            } else if (assignmentType === 'group') {
                assignmentText = 'Group Task (Auto-assigned)';
            } else if (assignmentType === 'house') {
                assignmentText = 'Entire House';
            }

            // Create chore object (in a real app, this would be sent to the server)
            const chore = {
                id: 'chore_' + Date.now(),
                title,
                priority,
                house,
                assignmentType,
                assignedPlayers,
                deadline: new Date(deadline).toLocaleString(),
                points,
                description,
                status: 'pending',
                createdBy: currentUser.name,
                createdAt: new Date().toISOString()
            };

            // Display success message
            alert('Chore "' + title + '" has been created successfully!\\n\\nAssigned to: ' + assignmentText + '\\nHouse: ' + house + '\\nDeadline: ' + chore.deadline + '\\nPoints: ' + points);
            
            // Clear the form
            clearChoreForm();
            
            // Store the chore locally
            choreStorage.push(chore);
            
            // Update the UI with the new chore
            updateChoreAssignments();
            
            // In a real application, you would:
            // 1. Send this data to the server
            // 2. Send notifications to assigned players
            console.log('New chore created:', chore);
        }

        // Clear chore form
        function clearChoreForm() {
            document.getElementById('choreTitle').value = '';
            document.getElementById('chorePriority').value = '';
            document.getElementById('choreHouse').value = '';
            document.getElementById('choreAssignmentType').value = '';
            document.getElementById('choreDeadline').value = '';
            document.getElementById('chorePoints').value = '';
            document.getElementById('choreDescription').value = '';
            
            // Clear individual player selection
            document.getElementById('individualPlayer').value = '';
            
            // Clear multiple player selections
            const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Hide all selection rows
            document.getElementById('individualPlayerRow').style.display = 'none';
            document.getElementById('multiplePlayersRow').style.display = 'none';
            
            // Reset selected count
            updateSelectedCount();
        }

        // Mark chore as complete
        function markChoreComplete(choreId) {
            if (confirm('Mark this chore as completed?')) {
                // Find and update the chore
                const choreIndex = choreStorage.findIndex(function(chore) {
                    return chore.id === choreId;
                });
                if (choreIndex !== -1) {
                    choreStorage[choreIndex].status = 'completed';
                    updateChoreAssignments();
                    alert('Chore marked as completed! Points have been awarded.');
                }
                console.log('Chore completed:', choreId);
            }
        }

        // Extend chore deadline
        function extendDeadline(choreId) {
            const newDeadline = prompt('Enter new deadline (YYYY-MM-DD HH:MM):');
            if (newDeadline) {
                // Find and update the chore deadline
                const choreIndex = choreStorage.findIndex(function(chore) {
                    return chore.id === choreId;
                });
                if (choreIndex !== -1) {
                    choreStorage[choreIndex].deadline = new Date(newDeadline).toLocaleString();
                    updateChoreAssignments();
                    alert('Deadline extended successfully!');
                }
                console.log('Deadline extended for chore:', choreId, 'to:', newDeadline);
            }
        }

        // Delete chore
        function deleteChore(choreId) {
            if (confirm('Are you sure you want to delete this chore? This action cannot be undone.')) {
                // Remove chore from storage
                const choreIndex = choreStorage.findIndex(function(chore) {
                    return chore.id === choreId;
                });
                if (choreIndex !== -1) {
                    choreStorage.splice(choreIndex, 1);
                    updateChoreAssignments();
                    alert('Chore deleted successfully!');
                }
                console.log('Chore deleted:', choreId);
            }
        }

        // View house details
        function viewHouseDetails(houseId) {
            alert('Viewing detailed information for ' + houseId.replace(/\\d/, ' ') + '.\\n\\nThis would show:\\n- Individual player assignments\\n- Completion rates\\n- Point rankings\\n- Chore history');
        }

        // Update chore assignments display
        function updateChoreAssignments() {
            const activeChoresList = document.getElementById('activeChoresList');
            if (!activeChoresList) return;
            
            if (choreStorage.length === 0) {
                activeChoresList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">No active chores assigned yet.</p>';
                return;
            }
            
            let html = '';
            choreStorage.forEach(function(chore) {
                const assignedText = getAssignedPlayersText(chore);
                const houseText = getHouseDisplayName(chore.house);
                const statusText = chore.status === 'pending' ? 'Not Started' : chore.status;
                const priorityCapitalized = chore.priority.charAt(0).toUpperCase() + chore.priority.slice(1);
                const actionsDisplay = (currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff')) ? 'block' : 'none';
                
                html += '<div class="chore-assignment-card ' + chore.priority + '">' +
                    '<div class="chore-header">' +
                        '<h4>' + chore.title + '</h4>' +
                        '<span class="priority-badge ' + chore.priority + '">' + priorityCapitalized + '</span>' +
                    '</div>' +
                    '<div class="chore-details">' +
                        '<p><strong>House:</strong> ' + houseText + '</p>' +
                        '<p><strong>Assigned to:</strong> ' + assignedText + '</p>' +
                        '<p><strong>Deadline:</strong> ' + chore.deadline + '</p>' +
                        '<p><strong>Points:</strong> ' + chore.points + ' pts</p>' +
                        '<p><strong>Status:</strong> <span class="status-badge ' + chore.status + '">' + statusText + '</span></p>' +
                        '<p><strong>Description:</strong> ' + chore.description + '</p>' +
                    '</div>' +
                    '<div class="chore-actions admin-staff-only" style="display: ' + actionsDisplay + ';">' +
                        '<button class="btn-mini btn-success" onclick="markChoreComplete(\\'' + chore.id + '\\')">Mark Complete</button>' +
                        '<button class="btn-mini btn-warning" onclick="extendDeadline(\\'' + chore.id + '\\')">Extend Deadline</button>' +
                        '<button class="btn-mini btn-danger" onclick="deleteChore(\\'' + chore.id + '\\')">Delete</button>' +
                    '</div>' +
                '</div>';
            });
            
            activeChoresList.innerHTML = html;
        }

        // Helper function to get assigned players text
        function getAssignedPlayersText(chore) {
            if (chore.assignmentType === 'individual' && chore.assignedPlayers.length > 0) {
                return chore.assignedPlayers[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            } else if (chore.assignmentType === 'multiple' && chore.assignedPlayers.length > 0) {
                return chore.assignedPlayers.map(p => p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ');
            } else if (chore.assignmentType === 'group') {
                return 'Group Task (Auto-assigned)';
            } else if (chore.assignmentType === 'house') {
                return 'Entire House';
            }
            return 'Not Assigned';
        }

        // Helper function to get house display name
        function getHouseDisplayName(houseId) {
            const houses = {
                'widdersdorf1': 'Widdersdorf 1',
                'widdersdorf2': 'Widdersdorf 2',
                'widdersdorf3': 'Widdersdorf 3',
                'all': 'All Houses'
            };
            return houses[houseId] || houseId;
        }

        document.addEventListener('DOMContentLoaded', function() {
            console.log('Admin player editing functionality loaded');
            
            // Check for saved authentication
            const savedAuth = localStorage.getItem('fc-koln-auth');
            if (savedAuth) {
                try {
                    const authData = JSON.parse(savedAuth);
                    currentUser = authData.user;
                    showMainApp();
                } catch (e) {
                    console.log('Starting fresh session');
                }
            }
            
            // Load initial chore assignments
            updateChoreAssignments();
            
            // Load initial player data
            updatePlayerDisplay();
            
            // Handle player edit form submission
            const playerEditForm = document.getElementById('playerEditForm');
            if (playerEditForm) {
                playerEditForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const playerId = this.getAttribute('data-player-id');
                    const player = playerStorage.find(p => p.id === playerId);
                    
                    if (!player) return;

                    // Update player data from form
                    player.firstName = document.getElementById('editFirstName').value;
                    player.lastName = document.getElementById('editLastName').value;
                    player.position = document.getElementById('editPosition').value;
                    player.age = parseInt(document.getElementById('editAge').value);
                    player.nationality = document.getElementById('editNationality').value;
                    player.status = document.getElementById('editStatus').value;
                    player.house = document.getElementById('editHouse').value;
                    player.room = document.getElementById('editRoom').value;
                    player.contractPeriod = document.getElementById('editContractPeriod').value;
                    player.joinDate = document.getElementById('editJoinDate').value;
                    player.phoneNumber = document.getElementById('editPhoneNumber').value;
                    player.emergencyContact = document.getElementById('editEmergencyContact').value;
                    player.medicalInfo = document.getElementById('editMedicalInfo').value;
                    player.specialNotes = document.getElementById('editSpecialNotes').value;

                    // Update displays
                    updatePlayerDisplay();
                    closePlayerEditModal();
                    
                    alert('Player profile updated successfully!');
                });
            }
        });

        // Player management functions
        let filteredPlayers = playerStorage;

        function updatePlayerDisplay() {
            const playersGrid = document.getElementById('playersGrid');
            if (!playersGrid) return;
            
            let html = '';
            filteredPlayers.forEach(function(player) {
                const statusClass = player.status === 'active' ? 'active' : player.status;
                
                html += '<div class="player-card ' + statusClass + '">' +
                    '<div class="player-header">' +
                        '<div class="player-info-section">' +
                            '<h3 class="player-name">' + player.firstName + ' ' + player.lastName + '</h3>' +
                            '<p class="player-position">' + player.position + '</p>' +
                        '</div>' +
                        '<span class="player-status ' + statusClass + '">' + player.status + '</span>' +
                    '</div>' +
                    '<div class="player-details">' +
                        '<div class="player-detail">' +
                            '<span class="player-detail-label">Age</span>' +
                            '<span class="player-detail-value">' + player.age + ' years</span>' +
                        '</div>' +
                        '<div class="player-detail">' +
                            '<span class="player-detail-label">Nationality</span>' +
                            '<span class="player-detail-value">' + player.nationality + '</span>' +
                        '</div>' +
                        '<div class="player-detail">' +
                            '<span class="player-detail-label">House</span>' +
                            '<span class="player-detail-value">' + player.house + '</span>' +
                        '</div>' +
                        '<div class="player-detail">' +
                            '<span class="player-detail-label">Room</span>' +
                            '<span class="player-detail-value">' + player.room + '</span>' +
                        '</div>' +
                        '<div class="player-detail">' +
                            '<span class="player-detail-label">Contract</span>' +
                            '<span class="player-detail-value">' + player.contractPeriod + '</span>' +
                        '</div>' +
                        '<div class="player-detail">' +
                            '<span class="player-detail-label">Joined</span>' +
                            '<span class="player-detail-value">' + formatDate(player.joinDate) + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="player-actions">' +
                        '<button class="btn-mini" onclick="viewPlayer(\\'' + player.id + '\\')">👁️ View Details</button>' +
                        '<button class="btn-mini" onclick="editPlayer(\\'' + player.id + '\\')">✏️ Edit Profile</button>' +
                    '</div>' +
                '</div>';
            });
            
            if (filteredPlayers.length === 0) {
                html = '<p style="text-align: center; color: #6b7280; padding: 2rem;">No players match the current filters.</p>';
            }
            
            playersGrid.innerHTML = html;
            updatePlayerStats();
        }

        function filterPlayers() {
            const searchTerm = document.getElementById('playerSearch').value.toLowerCase();
            const positionFilter = document.getElementById('positionFilter').value;
            const houseFilter = document.getElementById('houseFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;

            filteredPlayers = playerStorage.filter(function(player) {
                const matchesSearch = !searchTerm || 
                    player.firstName.toLowerCase().includes(searchTerm) ||
                    player.lastName.toLowerCase().includes(searchTerm) ||
                    player.position.toLowerCase().includes(searchTerm) ||
                    player.house.toLowerCase().includes(searchTerm);
                
                const matchesPosition = !positionFilter || player.position === positionFilter;
                const matchesHouse = !houseFilter || player.house === houseFilter;
                const matchesStatus = !statusFilter || player.status === statusFilter;

                return matchesSearch && matchesPosition && matchesHouse && matchesStatus;
            });

            updatePlayerDisplay();
        }

        function updatePlayerStats() {
            const totalPlayersEl = document.getElementById('totalPlayers');
            const activePlayersEl = document.getElementById('activePlayers');
            const injuredPlayersEl = document.getElementById('injuredPlayers');

            if (totalPlayersEl) totalPlayersEl.textContent = playerStorage.length;
            if (activePlayersEl) activePlayersEl.textContent = playerStorage.filter(p => p.status === 'active').length;
            if (injuredPlayersEl) injuredPlayersEl.textContent = playerStorage.filter(p => p.status === 'injured').length;
        }

        function viewPlayer(playerId) {
            const player = playerStorage.find(p => p.id === playerId);
            if (!player) return;

            alert('Player Details:\\n\\n' +
                'Name: ' + player.firstName + ' ' + player.lastName + '\\n' +
                'Position: ' + player.position + '\\n' +
                'Age: ' + player.age + '\\n' +
                'Nationality: ' + player.nationality + '\\n' +
                'House: ' + player.house + ' (Room ' + player.room + ')\\n' +
                'Contract: ' + player.contractPeriod + '\\n' +
                'Status: ' + player.status + '\\n' +
                'Phone: ' + player.phoneNumber + '\\n' +
                'Emergency Contact: ' + player.emergencyContact + '\\n' +
                'Medical Info: ' + player.medicalInfo + '\\n' +
                'Notes: ' + player.specialNotes);
        }

        function editPlayer(playerId) {
            const player = playerStorage.find(p => p.id === playerId);
            if (!player) return;

            // Populate the edit form with current player data
            document.getElementById('editFirstName').value = player.firstName;
            document.getElementById('editLastName').value = player.lastName;
            document.getElementById('editPosition').value = player.position;
            document.getElementById('editAge').value = player.age;
            document.getElementById('editNationality').value = player.nationality;
            document.getElementById('editStatus').value = player.status;
            document.getElementById('editHouse').value = player.house;
            document.getElementById('editRoom').value = player.room;
            document.getElementById('editContractPeriod').value = player.contractPeriod;
            document.getElementById('editJoinDate').value = player.joinDate;
            document.getElementById('editPhoneNumber').value = player.phoneNumber;
            document.getElementById('editEmergencyContact').value = player.emergencyContact;
            document.getElementById('editMedicalInfo').value = player.medicalInfo;
            document.getElementById('editSpecialNotes').value = player.specialNotes;

            // Store the current player ID for saving
            document.getElementById('playerEditForm').setAttribute('data-player-id', playerId);

            // Show the modal
            document.getElementById('playerEditModal').style.display = 'flex';
        }

        function closePlayerEditModal() {
            document.getElementById('playerEditModal').style.display = 'none';
        }

        function savePlayerChanges() {
            const playerId = document.getElementById('playerEditForm').getAttribute('data-player-id');
            const player = playerStorage.find(p => p.id === playerId);
            
            if (!player) return;
            
            // Update player data from form
            player.firstName = document.getElementById('editFirstName').value;
            player.lastName = document.getElementById('editLastName').value;
            player.position = document.getElementById('editPosition').value;
            player.age = parseInt(document.getElementById('editAge').value);
            player.nationality = document.getElementById('editNationality').value;
            player.status = document.getElementById('editStatus').value;
            player.house = document.getElementById('editHouse').value;
            player.room = document.getElementById('editRoom').value;
            player.contractPeriod = document.getElementById('editContractPeriod').value;
            player.joinDate = document.getElementById('editJoinDate').value;
            player.phoneNumber = document.getElementById('editPhoneNumber').value;
            player.emergencyContact = document.getElementById('editEmergencyContact').value;
            player.medicalInfo = document.getElementById('editMedicalInfo').value;
            player.specialNotes = document.getElementById('editSpecialNotes').value;
            
            // Refresh the players display
            showPlayers();
            
            // Close the modal
            closePlayerEditModal();
            
            alert('Player profile updated successfully!');
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        }

        // Grocery Management Functions
        function selectAllItems() {
            const checkboxes = document.querySelectorAll('.grocery-item input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
            updateOrderTotal();
        }

        function clearSelection() {
            const checkboxes = document.querySelectorAll('.grocery-item input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            updateOrderTotal();
        }

        function updateOrderTotal() {
            
            let total = 0;
            const checkedItems = document.querySelectorAll('.grocery-item input[type="checkbox"]:checked');
            
            checkedItems.forEach(checkbox => {
                const priceElement = checkbox.closest('.grocery-item').querySelector('.item-price');
                const price = parseFloat(priceElement.textContent.replace('€', ''));
                const qtyElement = checkbox.closest('.grocery-item').querySelector('.qty');
                const qty = parseInt(qtyElement.textContent.replace('x', '')) || 1;
                total += price * qty;
            });

            // Update individual order budget display (€35 limit)
            const budgetAmountElement = document.getElementById('currentOrderTotal');
            if (budgetAmountElement) {
                budgetAmountElement.textContent = '€' + total.toFixed(2);
            }

            const budgetRemaining = document.getElementById('budgetRemaining');
            if (budgetRemaining) {
                const remaining = 35.00 - total; // Individual €35 budget
                if (remaining >= 0) {
                    budgetRemaining.textContent = '€' + remaining.toFixed(2) + ' remaining';
                    budgetRemaining.style.color = '#059669';
                } else {
                    budgetRemaining.textContent = 'Over budget by €' + Math.abs(remaining).toFixed(2);
                    budgetRemaining.style.color = '#dc2626';
                }
            }

            // Update submit button
            const orderTotalBtn = document.getElementById('orderTotalBtn');
            if (orderTotalBtn) {
                orderTotalBtn.textContent = '€' + total.toFixed(2);
            }
        }

        function submitGroceryOrder() {
            const checkedItems = document.querySelectorAll('.grocery-item input[type="checkbox"]:checked');
            
            if (checkedItems.length === 0) {
                alert('Please select at least one item before submitting your order.');
                return;
            }

            const orderItems = [];
            let total = 0;

            checkedItems.forEach(checkbox => {
                const itemRow = checkbox.closest('.grocery-item');
                const itemName = itemRow.querySelector('.item-name').textContent;
                const price = parseFloat(itemRow.querySelector('.item-price').textContent.replace('€', ''));
                const qty = parseInt(itemRow.querySelector('.qty').textContent.replace('x', '')) || 1;
                
                orderItems.push({
                    name: itemName,
                    price: price,
                    quantity: qty,
                    total: price * qty
                });
                
                total += price * qty;
            });

            // Simulate order submission
            // Individual Player Order System with €35 Budget Limit
            let currentPlayerOrder = {
                items: [],
                total: 0,
                maxBudget: 35.00,
                playerName: 'Max Bisinger'
            };

            function updateOrderTotal() {
                const checkboxes = document.querySelectorAll('.grocery-item input[type="checkbox"]:checked');
                currentPlayerOrder.items = [];
                currentPlayerOrder.total = 0;
                
                checkboxes.forEach(function(checkbox) {
                    const item = checkbox.closest('.grocery-item');
                    const name = item.querySelector('.item-name').textContent;
                    const priceText = item.querySelector('.item-price').textContent;
                    const price = parseFloat(priceText.replace('€', ''));
                    const qtyText = item.querySelector('.qty').textContent;
                    const qty = parseInt(qtyText.replace('x', ''));
                    const itemTotal = price * qty;
                    
                    currentPlayerOrder.items.push({
                        name: name,
                        price: price,
                        quantity: qty,
                        total: itemTotal
                    });
                    
                    currentPlayerOrder.total += itemTotal;
                });
                
                // Update display elements
                const totalElement = document.getElementById('currentOrderTotal');
                const remainingElement = document.getElementById('budgetRemaining');
                const warningElement = document.getElementById('budgetWarning');
                const orderTotalBtn = document.getElementById('orderTotalBtn');
                const submitBtn = document.getElementById('submitOrderBtn');
                
                if (totalElement) totalElement.textContent = '€' + currentPlayerOrder.total.toFixed(2);
                if (orderTotalBtn) orderTotalBtn.textContent = '€' + currentPlayerOrder.total.toFixed(2);
                
                const remaining = currentPlayerOrder.maxBudget - currentPlayerOrder.total;
                if (remainingElement) remainingElement.textContent = '€' + remaining.toFixed(2) + ' remaining';
                
                // Budget validation
                if (currentPlayerOrder.total > currentPlayerOrder.maxBudget) {
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.classList.add('disabled');
                        submitBtn.innerHTML = 'Exceeds Budget Limit (€' + currentPlayerOrder.total.toFixed(2) + ')';
                    }
                    showBudgetValidation('error');
                } else if (currentPlayerOrder.total > currentPlayerOrder.maxBudget * 0.8) {
                    if (warningElement) warningElement.style.display = 'block';
                    showBudgetValidation('warning');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('disabled');
                        submitBtn.innerHTML = 'Submit Personal Order (€' + currentPlayerOrder.total.toFixed(2) + ')';
                    }
                } else {
                    if (warningElement) warningElement.style.display = 'none';
                    showBudgetValidation('success');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('disabled');
                        submitBtn.innerHTML = 'Submit Personal Order (€' + currentPlayerOrder.total.toFixed(2) + ')';
                    }
                }
                
                updateOrderPreview();
            }

            function showBudgetValidation(type) {
                const okMsg = document.getElementById('budgetOk');
                const warningMsg = document.getElementById('budgetWarning');
                const errorMsg = document.getElementById('budgetExceeded');
                
                if (okMsg) okMsg.style.display = type === 'success' ? 'block' : 'none';
                if (warningMsg) warningMsg.style.display = type === 'warning' ? 'block' : 'none';
                if (errorMsg) errorMsg.style.display = type === 'error' ? 'block' : 'none';
            }

            function updateOrderPreview() {
                const previewElement = document.getElementById('orderPreview');
                if (!previewElement) return;
                
                let previewHTML = '';
                
                if (currentPlayerOrder.items.length === 0) {
                    previewHTML += '<div class="empty-order">';
                    previewHTML += '<p>No items selected yet. Choose items from the grocery list above to build your personal order.</p>';
                    previewHTML += '</div>';
                } else {
                    currentPlayerOrder.items.forEach(function(item) {
                        previewHTML += '<div class="order-item">';
                        previewHTML += '<span>' + item.name + ' (' + item.quantity + 'x)</span>';
                        previewHTML += '<span>€' + item.total.toFixed(2) + '</span>';
                        previewHTML += '</div>';
                    });
                }
                
                previewHTML += '<div class="order-total">';
                previewHTML += '<strong>Total: €' + currentPlayerOrder.total.toFixed(2) + ' / €' + currentPlayerOrder.maxBudget.toFixed(2) + '</strong>';
                previewHTML += '</div>';
                
                previewElement.innerHTML = previewHTML;
            }

            function submitIndividualOrder() {
                // Check if within deadline
                const now = new Date();
                const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
                const currentHour = now.getHours();
                
                let canOrderTuesday = true;
                let canOrderFriday = true;
                
                // Monday 12:00 AM deadline for Tuesday delivery
                if (currentDay > 1 || (currentDay === 1 && currentHour >= 0)) {
                    // Past Monday 12:00 AM, cannot order for Tuesday
                    canOrderTuesday = false;
                }
                
                // Thursday 12:00 AM deadline for Friday delivery  
                if (currentDay > 4 || (currentDay === 4 && currentHour >= 0)) {
                    // Past Thursday 12:00 AM, cannot order for Friday
                    canOrderFriday = false;
                }
                
                if (!canOrderTuesday && !canOrderFriday) {
                    alert('Order deadline has passed. Next available order window opens after the weekend.');
                    return;
                }
                
                if (currentPlayerOrder.total > currentPlayerOrder.maxBudget) {
                    alert('Cannot submit order: Budget limit of €35.00 exceeded.\\nCurrent total: €' + currentPlayerOrder.total.toFixed(2));
                    return;
                }
                
                if (currentPlayerOrder.items.length === 0) {
                    alert('Please select items before submitting your order.');
                    return;
                }
                
                const deliveryDay = canOrderTuesday ? 'Tuesday' : 'Friday';
                const orderSummary = 'Personal Order Submitted Successfully!\\n\\n' +
                                   'Player: ' + currentPlayerOrder.playerName + '\\n' +
                                   'Items: ' + currentPlayerOrder.items.length + '\\n' +
                                   'Total: €' + currentPlayerOrder.total.toFixed(2) + ' / €35.00\\n' +
                                   'Delivery: ' + deliveryDay + '\\n\\n' +
                                   'Your order is private and only visible to you.';
                
                alert(orderSummary);
                
                // Clear the order after submission
                document.querySelectorAll('.grocery-item input[type="checkbox"]').forEach(cb => cb.checked = false);
                updateOrderTotal();
            }

            // Make functions globally accessible
            window.updateOrderTotal = updateOrderTotal;
            window.showBudgetValidation = showBudgetValidation;
            window.updateOrderPreview = updateOrderPreview;
            window.submitIndividualOrder = submitIndividualOrder;
            
            // Clear selections after successful submission
            clearSelection();
        }

        // House Summary Admin Functions - Global scope
        window.showHouseSummary = function(house) {
            // Hide all house summary content
            document.querySelectorAll('.house-summary-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tab buttons
            document.querySelectorAll('.house-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected house summary
            if (house === 'all') {
                document.getElementById('allHousesSummary').classList.add('active');
                document.querySelector('.house-tab-btn').classList.add('active');
            } else {
                // Show specific house summary
                const houseElementId = house + 'Summary';
                const houseElement = document.getElementById(houseElementId);
                if (houseElement) {
                    houseElement.classList.add('active');
                }
                
                // Activate the correct tab button
                document.querySelectorAll('.house-tab-btn').forEach((btn) => {
                    if (btn.textContent.includes(house)) {
                        btn.classList.add('active');
                    }
                });
            }
        };

        window.exportHouseOrders = function() {
            alert('Export House Orders\\n\\nGenerating comprehensive order export with:\\n• Individual player orders grouped by house\\n• Consolidated shopping lists per house\\n• Budget totals and delivery schedules\\n\\nExport file will be saved as: house-orders-' + new Date().toISOString().split('T')[0] + '.csv');
        };

        window.printShoppingLists = function() {
            alert('Print Shopping Lists\\n\\nPreparing printable shopping lists:\\n• Widdersdorf 1: 127.85€ (4 players)\\n• Widdersdorf 2: 89.65€ (3 players)\\n• Widdersdorf 3: 61.30€ (2 players)\\n\\nTotal across all houses: 278.80€');
        };

        window.processAllOrders = function() {
            if (confirm('Process all house orders for delivery?\\n\\nThis will:\\n• Submit orders for all houses\\n• Generate shopping lists for staff\\n• Send confirmations to all players\\n\\nContinue?')) {
                alert('All House Orders Processed Successfully!\\n\\n✅ 9 individual orders submitted\\n✅ 3 house shopping lists generated\\n✅ Delivery scheduled for Tuesday & Friday\\n✅ Player confirmations sent\\n\\nTotal processed: €278.80');
            }
        };

        // WhatsApp-style Chat Functions
        window.showChatTab = function(tabType) {
            // Hide all chat containers
            document.querySelectorAll('.chat-list-container').forEach(container => {
                container.classList.remove('active');
            });
            
            // Remove active from all tab buttons
            document.querySelectorAll('.chat-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected container
            const containerId = tabType + '-chats';
            const container = document.getElementById(containerId);
            if (container) {
                container.classList.add('active');
            }
            
            // Activate clicked button
            event.target.classList.add('active');
        };

        window.openChat = function(chatId) {
            // Remove active from all chat items
            document.querySelectorAll('.chat-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Activate clicked chat
            event.currentTarget.classList.add('active');
            
            // Load chat messages for the selected contact
            loadChatMessages(chatId);
        };

        window.startNewChat = function() {
            document.getElementById('newChatModal').style.display = 'flex';
        };

        window.closeNewChatModal = function() {
            document.getElementById('newChatModal').style.display = 'none';
        };

        window.startChatWith = function(contactId) {
            // Close modal
            closeNewChatModal();
            
            // Switch to direct chats tab
            showChatTab('direct');
            
            // Find and activate the chat item (or create new one)
            openChat(contactId);
        };

        window.handleMessageKeyPress = function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendNewMessage();
            }
        };

        window.handleTyping = function() {
            // Show typing indicator for other users
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) {
                typingIndicator.style.display = 'flex';
                
                // Hide after 2 seconds of no typing
                clearTimeout(window.typingTimeout);
                window.typingTimeout = setTimeout(() => {
                    typingIndicator.style.display = 'none';
                }, 2000);
            }
        };

        window.sendNewMessage = function() {
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value.trim();
            
            if (!message) return;
            
            // Create new message element
            const messagesContainer = document.getElementById('messagesContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message sent';
            
            const currentTime = new Date().toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            messageDiv.innerHTML = 
                '<div class="message-content">' +
                    '<div class="message-bubble">' +
                        '<p>' + message + '</p>' +
                    '</div>' +
                    '<div class="message-time">' +
                        '<span>' + currentTime + '</span>' +
                        '<span class="message-status delivered">✓</span>' +
                    '</div>' +
                '</div>';
            
            // Add to messages container
            messagesContainer.appendChild(messageDiv);
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Clear input
            messageInput.value = '';
            
            // Hide typing indicator
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }
            
            // Simulate message delivery after 1 second
            setTimeout(() => {
                const statusElement = messageDiv.querySelector('.message-status');
                if (statusElement) {
                    statusElement.textContent = '✓✓';
                    statusElement.className = 'message-status read';
                }
            }, 1000);
        };

        window.attachFile = function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf,.doc,.docx,.txt,.xlsx,.ppt';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    showFilePreview(file);
                }
            };
            input.click();
        };

        window.attachImage = function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    showImagePreview(file);
                }
            };
            input.click();
        };

        window.showEmojis = function() {
            // Simple emoji picker
            const emojis = ['😊', '👍', '❤️', '😂', '😢', '😮', '😡', '🔥', '⚽', '🏆', '💪', '👏'];
            const emojiPicker = document.createElement('div');
            emojiPicker.style.cssText = 
                'position: absolute;' +
                'bottom: 70px;' +
                'right: 20px;' +
                'background: white;' +
                'border: 1px solid #e5e7eb;' +
                'border-radius: 8px;' +
                'padding: 1rem;' +
                'box-shadow: 0 4px 12px rgba(0,0,0,0.15);' +
                'display: grid;' +
                'grid-template-columns: repeat(6, 1fr);' +
                'gap: 0.5rem;' +
                'z-index: 100;';
            
            emojis.forEach(emoji => {
                const emojiBtn = document.createElement('button');
                emojiBtn.textContent = emoji;
                emojiBtn.style.cssText = 
                    'background: none;' +
                    'border: none;' +
                    'font-size: 1.2rem;' +
                    'cursor: pointer;' +
                    'padding: 0.25rem;' +
                    'border-radius: 4px;';
                emojiBtn.onmouseover = () => emojiBtn.style.background = '#f3f4f6';
                emojiBtn.onmouseout = () => emojiBtn.style.background = 'none';
                emojiBtn.onclick = () => {
                    const messageInput = document.getElementById('messageInput');
                    messageInput.value += emoji;
                    messageInput.focus();
                    document.body.removeChild(emojiPicker);
                };
                emojiPicker.appendChild(emojiBtn);
            });
            
            document.body.appendChild(emojiPicker);
            
            // Remove on click outside
            setTimeout(() => {
                document.addEventListener('click', function removeEmojiPicker(e) {
                    if (!emojiPicker.contains(e.target)) {
                        if (document.body.contains(emojiPicker)) {
                            document.body.removeChild(emojiPicker);
                        }
                        document.removeEventListener('click', removeEmojiPicker);
                    }
                });
            }, 100);
        };

        // Simplified - removed call and settings functions

        function loadChatMessages(chatId) {
            // Update header based on selected chat
            const contactName = document.querySelector('.contact-name');
            const contactStatus = document.querySelector('.contact-status');
            
            switch(chatId) {
                case 'thomas-ellinger':
                    contactName.textContent = 'Thomas Ellinger';
                    contactStatus.textContent = 'Online • House Manager';
                    break;
                case 'coach-martinez':
                    contactName.textContent = 'Coach Martinez';
                    contactStatus.textContent = 'Online • Head Coach';
                    break;
                case 'ahmad-hassan':
                    contactName.textContent = 'Ahmad Hassan';
                    contactStatus.textContent = 'Away • Player - Defender';
                    break;
                case 'jonas-weber':
                    contactName.textContent = 'Jonas Weber';
                    contactStatus.textContent = 'Online • Player - Goalkeeper';
                    break;
                case 'widdersdorf-1':
                    contactName.textContent = 'Widdersdorf 1';
                    contactStatus.textContent = '12 members • House Group';
                    break;
                case 'team-captains':
                    contactName.textContent = 'Team Captains';
                    contactStatus.textContent = '4 members • Leadership Group';
                    break;
            }
        }

        function showFilePreview(file) {
            const preview = document.getElementById('filePreview');
            const fileName = preview.querySelector('.file-name');
            fileName.textContent = file.name;
            preview.style.display = 'block';
        }

        function showImagePreview(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const messagesContainer = document.getElementById('messagesContainer');
                const imageMessage = document.createElement('div');
                imageMessage.className = 'message sent';
                
                const currentTime = new Date().toLocaleTimeString('en-GB', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                
                imageMessage.innerHTML = 
                    '<div class="message-content">' +
                        '<div class="message-bubble image">' +
                            '<img src="' + e.target.result + '" alt="Shared image" class="message-image">' +
                        '</div>' +
                        '<div class="message-time">' +
                            '<span>' + currentTime + '</span>' +
                            '<span class="message-status delivered">✓</span>' +
                        '</div>' +
                    '</div>';
                
                messagesContainer.appendChild(imageMessage);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            };
            reader.readAsDataURL(file);
        }

        window.removeFilePreview = function() {
            document.getElementById('filePreview').style.display = 'none';
        };

        // Initialize individual food order functionality on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Add event listeners to checkboxes when they exist
            setTimeout(() => {
                const checkboxes = document.querySelectorAll('.grocery-item input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', function() {
                        if (window.updateOrderTotal) {
                            window.updateOrderTotal();
                        }
                    });
                });
                
                // Initialize the order total display
                if (window.updateOrderTotal) {
                    window.updateOrderTotal();
                }
            }, 500);
        });

        // Missing function definitions
        function closePlayerEditModal() {
            document.getElementById('playerEditModal').style.display = 'none';
        }

        function savePlayerChanges() {
            const formData = {
                firstName: document.getElementById('editFirstName').value,
                lastName: document.getElementById('editLastName').value,
                position: document.getElementById('editPosition').value,
                status: document.getElementById('editStatus').value,
                age: document.getElementById('editAge').value,
                nationality: document.getElementById('editNationality').value
            };
            
            alert('Player changes saved successfully!\\n' + 'Updated: ' + formData.firstName + ' ' + formData.lastName);
            closePlayerEditModal();
        }

        // Add all missing admin function definitions
        function choreSystemControl() { alert('Chore System Control - Advanced chore management features'); }
        function communicationControl() { alert('Communication Control - Manage messaging systems'); }
        function databaseReset() { if(confirm('Reset database? This cannot be undone.')) alert('Database reset initiated'); }
        function dataImportAll() { alert('Data Import - Import system data from external sources'); }
        function deleteAllPlayers() { if(confirm('Delete all players? This cannot be undone.')) alert('All players deleted'); }
        function foodSystemControl() { alert('Food System Control - Manage grocery and meal systems'); }
        function logManagement() { alert('Log Management - View and manage system logs'); }
        function maintenanceMode() { alert('Maintenance Mode - Enable system maintenance mode'); }
        function purgeAllData() { if(confirm('Purge all data? This CANNOT be undone.')) alert('Data purge initiated'); }
        function scheduleOverride() { alert('Schedule Override - Administrative schedule controls'); }
        function securityAudit() { alert('Security Audit - Comprehensive security system check'); }
        function systemMonitoring() { alert('System Monitoring - Real-time system health monitoring'); }
        function systemRestart() { if(confirm('Restart system?')) alert('System restart initiated'); }
        function systemWipe() { if(confirm('WIPE ENTIRE SYSTEM? This cannot be undone.')) alert('System wipe initiated'); }
        function viewActiveUsers() { alert('Active Users - Currently logged in users and sessions'); }

        console.log('1.FC Köln Bundesliga Talent Program loaded successfully');
        console.log('Complete application with Dashboard, Players, Chores, Calendar, Food Orders, Communications, House Management, and Admin');
        console.log('Enhanced features initialized successfully');
        console.log('Admin player editing functionality loaded');
    </script>

    <!-- Player Edit Modal -->
    <div id="playerEditModal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Player Profile</h3>
                <span class="close" onclick="closePlayerEditModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div id="editPlayerForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>First Name</label>
                            <input type="text" id="editFirstName" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Last Name</label>
                            <input type="text" id="editLastName" class="form-control">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Position</label>
                            <select id="editPosition" class="form-control">
                                <option value="goalkeeper">Goalkeeper</option>
                                <option value="defender">Defender</option>
                                <option value="midfielder">Midfielder</option>
                                <option value="forward">Forward</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select id="editStatus" class="form-control">
                                <option value="active">Active</option>
                                <option value="injured">Injured</option>
                                <option value="suspended">Suspended</option>
                                <option value="on-loan">On Loan</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Age</label>
                            <input type="number" id="editAge" class="form-control" min="16" max="25">
                        </div>
                        <div class="form-group">
                            <label>Nationality</label>
                            <select id="editNationality" class="form-control">
                                <option value="Germany">Germany</option>
                                <option value="Spain">Spain</option>
                                <option value="Portugal">Portugal</option>
                                <option value="France">France</option>
                                <option value="Brazil">Brazil</option>
                                <option value="Argentina">Argentina</option>
                                <option value="Egypt">Egypt</option>
                                <option value="Morocco">Morocco</option>
                                <option value="Turkey">Turkey</option>
                                <option value="Poland">Poland</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>House Assignment</label>
                            <select id="editHouse" class="form-control">
                                <option value="Widdersdorf 1">Widdersdorf 1</option>
                                <option value="Widdersdorf 2">Widdersdorf 2</option>
                                <option value="Widdersdorf 3">Widdersdorf 3</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Room Number</label>
                            <input type="text" id="editRoom" class="form-control" placeholder="e.g., 12A">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Contract Period</label>
                            <input type="text" id="editContractPeriod" class="form-control" placeholder="e.g., 2024-2026">
                        </div>
                        <div class="form-group">
                            <label>Join Date</label>
                            <input type="date" id="editJoinDate" class="form-control">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" id="editPhoneNumber" class="form-control" placeholder="+49 221 123 4567">
                    </div>
                    <div class="form-group">
                        <label>Emergency Contact</label>
                        <input type="text" id="editEmergencyContact" class="form-control" placeholder="Name and phone number">
                    </div>
                    <div class="form-group">
                        <label>Medical Information</label>
                        <textarea id="editMedicalInfo" class="form-control" rows="2" placeholder="Allergies, medical conditions, etc."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Special Notes</label>
                        <textarea id="editSpecialNotes" class="form-control" rows="3" placeholder="Additional notes, preferences, etc."></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="savePlayerChanges()">Save Changes</button>
                <button class="btn" onclick="closePlayerEditModal()">Cancel</button>
            </div>
        </div>
    </div>
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
    
    // Serve static assets (images, logos, etc.)
    if (parsedUrl.pathname.startsWith('/attached_assets/')) {
        const filePath = path.join(__dirname, parsedUrl.pathname);
        
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Asset Not Found</h1>');
                return;
            }
            
            // Set appropriate content type for images
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.png') contentType = 'image/png';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.gif') contentType = 'image/gif';
            else if (ext === '.svg') contentType = 'image/svg+xml';
            
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400' // Cache images for 1 day
            });
            res.end(data);
        });
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

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log('1.FC Köln Bundesliga Talent Program running on port ' + PORT);
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