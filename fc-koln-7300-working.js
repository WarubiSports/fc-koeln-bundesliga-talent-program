#!/usr/bin/env node

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Import SendGrid for email functionality
let sgMail;
try {
    sgMail = require('@sendgrid/mail');
    if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        console.log('SendGrid email service initialized');
    } else {
        console.log('SendGrid API key not found - email features disabled');
    }
} catch (err) {
    console.log('SendGrid not available - email features disabled');
}

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

        .forgot-password-section {
            text-align: center;
            margin-top: 1rem;
        }

        .forgot-password-link {
            color: #dc2626;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
        }

        .forgot-password-link:hover {
            text-decoration: underline;
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
                
                <div class="forgot-password-section">
                    <a href="#" onclick="showForgotPassword()" class="forgot-password-link">Forgot Password?</a>
                </div>
                
                <div id="loginMessage"></div>
            </div>
            
            <!-- Public Registration Tab -->
            <div id="register-auth-tab" class="auth-tab-content">
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
                                        <div class="activity-title">Training Schedule Update</div>
                                        <div class="activity-description">Coach updated afternoon training session plan</div>
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
                <h1>Training Calendar & Schedule Management</h1>
                
                <!-- Weekly Overview -->
                <div class="form-section">
                    <h3>📅 This Week's Schedule</h3>
                    <div class="calendar-grid enhanced">
                        <div class="calendar-day">
                            <strong>Monday</strong>
                            <div class="calendar-event training">
                                <span class="event-time">9:00 AM</span>
                                <span class="event-title">Morning Training</span>
                                <span class="attendance">24/24 ✓</span>
                            </div>
                            <div class="calendar-event tactical">
                                <span class="event-time">3:00 PM</span>
                                <span class="event-title">Tactical Session</span>
                                <span class="attendance">22/24</span>
                            </div>
                        </div>
                        <div class="calendar-day">
                            <strong>Tuesday</strong>
                            <div class="calendar-event fitness">
                                <span class="event-time">10:00 AM</span>
                                <span class="event-title">Fitness Training</span>
                                <span class="attendance">24/24 ✓</span>
                            </div>
                            <div class="calendar-event recovery">
                                <span class="event-time">2:00 PM</span>
                                <span class="event-title">Recovery Session</span>
                                <span class="attendance">18/24</span>
                            </div>
                        </div>
                        <div class="calendar-day">
                            <strong>Wednesday</strong>
                            <div class="calendar-event technical">
                                <span class="event-time">9:00 AM</span>
                                <span class="event-title">Technical Skills</span>
                                <span class="attendance">23/24</span>
                            </div>
                            <div class="calendar-event match-prep">
                                <span class="event-time">4:00 PM</span>
                                <span class="event-title">Match Preparation</span>
                                <span class="attendance">24/24 ✓</span>
                            </div>
                        </div>
                        <div class="calendar-day">
                            <strong>Thursday</strong>
                            <div class="calendar-event light">
                                <span class="event-time">10:00 AM</span>
                                <span class="event-title">Light Training</span>
                                <span class="attendance">20/24</span>
                            </div>
                            <div class="calendar-event analysis">
                                <span class="event-time">3:00 PM</span>
                                <span class="event-title">Video Analysis</span>
                                <span class="attendance">24/24 ✓</span>
                            </div>
                        </div>
                        <div class="calendar-day">
                            <strong>Friday</strong>
                            <div class="calendar-event preparation">
                                <span class="event-time">10:00 AM</span>
                                <span class="event-title">Match Day Prep</span>
                                <span class="attendance">24/24 ✓</span>
                            </div>
                            <div class="calendar-event meeting">
                                <span class="event-time">1:00 PM</span>
                                <span class="event-title">Team Meeting</span>
                                <span class="attendance">24/24 ✓</span>
                            </div>
                        </div>
                        <div class="calendar-day match-day">
                            <strong>Saturday</strong>
                            <div class="calendar-event match">
                                <span class="event-time">3:00 PM</span>
                                <span class="event-title">vs BVB U19</span>
                                <span class="match-venue">RheinEnergie Stadion</span>
                            </div>
                        </div>
                        <div class="calendar-day">
                            <strong>Sunday</strong>
                            <div class="calendar-event recovery">
                                <span class="event-time">11:00 AM</span>
                                <span class="event-title">Optional Recovery</span>
                                <span class="attendance">12/24</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Performance Tracking -->
                <div class="form-section">
                    <h3>📊 Weekly Performance Metrics</h3>
                    <div class="metrics-dashboard">
                        <div class="metric-card">
                            <h4>Overall Attendance</h4>
                            <div class="metric-value">92.3%</div>
                            <div class="metric-trend up">↗ +2.1% vs last week</div>
                        </div>
                        <div class="metric-card">
                            <h4>Training Intensity</h4>
                            <div class="metric-value">High</div>
                            <div class="metric-detail">8.4/10 average rating</div>
                        </div>
                        <div class="metric-card">
                            <h4>Injury Rate</h4>
                            <div class="metric-value">0%</div>
                            <div class="metric-trend stable">No injuries this week</div>
                        </div>
                        <div class="metric-card">
                            <h4>Session Feedback</h4>
                            <div class="metric-value">4.7/5</div>
                            <div class="metric-detail">Player satisfaction score</div>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Events -->
                <div class="form-section">
                    <h3>🎯 Upcoming Matches & Events</h3>
                    <div class="upcoming-events">
                        <div class="event-card match-event">
                            <div class="event-date">
                                <span class="day">25</span>
                                <span class="month">JAN</span>
                            </div>
                            <div class="event-info">
                                <h4>FC Köln U19 vs Borussia Dortmund U19</h4>
                                <p>📍 RheinEnergie Stadion • 15:00</p>
                                <span class="event-status home">Home Match</span>
                            </div>
                        </div>
                        <div class="event-card training-event">
                            <div class="event-date">
                                <span class="day">27</span>
                                <span class="month">JAN</span>
                            </div>
                            <div class="event-info">
                                <h4>Winter Training Camp</h4>
                                <p>📍 Düsseldorf Training Center • 3 Days</p>
                                <span class="event-status camp">Training Camp</span>
                            </div>
                        </div>
                        <div class="event-card admin-event">
                            <div class="event-date">
                                <span class="day">01</span>
                                <span class="month">FEB</span>
                            </div>
                            <div class="event-info">
                                <h4>Medical Check-ups</h4>
                                <p>📍 Medical Center • All Day</p>
                                <span class="event-status medical">Health Assessment</span>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            <!-- Food Orders Page -->
            <div id="food-orders" class="page">
                <h1>🛒 Individual Food Orders</h1>
                
                <!-- Player vs Admin View Toggle -->
                <div class="form-section" id="orderViewToggle" style="display: none;">
                    <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                        <button onclick="showPlayerOrdering()" class="btn btn-primary" id="playerOrderBtn">My Orders</button>
                        <button onclick="showAdminSummary()" class="btn" id="adminSummaryBtn">House Summaries</button>
                    </div>
                </div>

                <!-- Delivery Schedule & Deadlines -->
                <div class="form-section">
                    <h3>📅 Delivery Schedule & Order Deadlines</h3>
                    <div class="delivery-schedule">
                        <div class="delivery-card tuesday">
                            <h4>Tuesday Delivery</h4>
                            <div class="deadline-info">
                                <strong>Order Deadline: Monday 8:00 AM</strong>
                                <p>Delivery arrives between 6-8 PM</p>
                            </div>
                            <div class="next-delivery">
                                <span>Next Order Due: Monday, July 29</span>
                            </div>
                        </div>
                        <div class="delivery-card friday">
                            <h4>Friday Delivery</h4>
                            <div class="deadline-info">
                                <strong>Order Deadline: Thursday 8:00 AM</strong>
                                <p>Delivery arrives between 6-8 PM</p>
                            </div>
                            <div class="next-delivery">
                                <span>Next Order Due: Thursday, August 1</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Player Individual Ordering Section -->
                <div id="playerOrderingSection" class="form-section">
                    <h3>🛒 Place Your Individual Order</h3>
                    <div id="playerOrderStatus" style="margin-bottom: 1rem;"></div>
                    
                    <!-- Current Cart Overview -->
                    <div class="budget-overview">
                        <div class="budget-card">
                            <h4>Your Current Cart</h4>
                            <div class="budget-amount large" id="playerCartTotal">€0.00</div>
                            <div class="budget-limit">Weekly Budget: €50.00</div>
                            <div class="budget-remaining" id="playerBudgetRemaining">€50.00 remaining</div>
                        </div>
                    </div>
                    
                    <!-- Food Categories for Individual Ordering -->
                    <div class="grocery-categories" id="individualFoodCatalog">
                        <div class="category-section">
                            <h4 class="category-title">🥬 Vegetables & Fruits</h4>
                            <div class="items-grid" id="vegetables-items"></div>
                        </div>
                        <div class="category-section">
                            <h4 class="category-title">🥩 Meat & Protein</h4>
                            <div class="items-grid" id="meat-items"></div>
                        </div>
                        <div class="category-section">
                            <h4 class="category-title">🧀 Dairy Products</h4>
                            <div class="items-grid" id="dairy-items"></div>
                        </div>
                        <div class="category-section">
                            <h4 class="category-title">🍞 Carbohydrates</h4>
                            <div class="items-grid" id="carbs-items"></div>
                        </div>
                        <div class="category-section">
                            <h4 class="category-title">🥤 Drinks</h4>
                            <div class="items-grid" id="drinks-items"></div>
                        </div>
                        <div class="category-section">
                            <h4 class="category-title">🍿 Snacks</h4>
                            <div class="items-grid" id="snacks-items"></div>
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn btn-secondary" onclick="clearPlayerCart()">Clear Cart</button>
                        <button class="btn btn-primary" onclick="submitPlayerOrder()" id="submitPlayerOrderBtn">Place Order (€0.00)</button>
                    </div>
                </div>

                <!-- Admin House Summary Section -->
                <div id="adminSummarySection" class="form-section" style="display: none;">
                    <h3>📊 House Order Summaries</h3>
                    <div id="houseSummaries">
                        <div class="house-summary-tabs">
                            <button onclick="showHouseSummary('Widdersdorf 1')" class="house-tab active" id="w1-tab">Widdersdorf 1</button>
                            <button onclick="showHouseSummary('Widdersdorf 2')" class="house-tab" id="w2-tab">Widdersdorf 2</button>
                            <button onclick="showHouseSummary('Widdersdorf 3')" class="house-tab" id="w3-tab">Widdersdorf 3</button>
                        </div>
                        <div id="houseSummaryContent"></div>
                    </div>
                </div>

                <!-- Individual Orders History -->
                <div class="form-section">
                    <h3>📦 Your Order History</h3>
                    <div id="playerOrderHistory">
                        <div class="order-card pending">
                            <div class="order-header">
                                <h4>Tuesday Delivery - July 30</h4>
                                <span class="status-badge pending">Submitted</span>
                            </div>
                            <div class="order-details">
                                <p>3 items • Total: €12.47</p>
                                <p>Delivery: Tuesday 6-8 PM to Widdersdorf 1</p>
                            </div>
                        </div>
                    </div>
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
                <h1>🏠 Housing & Chore Management</h1>
                
                <!-- Admin/Staff Chore Creation (Only visible to Thomas & Max) -->
                <div class="admin-staff-only form-section" style="display: none;">
                    <h3>➕ Create New Chore Assignment</h3>
                    <div class="chore-creation-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Chore Title *</label>
                                <input type="text" id="choreTitle" placeholder="e.g., Clean Kitchen" required>
                            </div>
                            <div class="form-group">
                                <label>House Assignment *</label>
                                <select id="choreHouse" required>
                                    <option value="">Select House</option>
                                    <option value="Widdersdorf 1">Widdersdorf 1</option>
                                    <option value="Widdersdorf 2">Widdersdorf 2</option>
                                    <option value="Widdersdorf 3">Widdersdorf 3</option>
                                    <option value="All Houses">All Houses</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Specific Players (Optional)</label>
                                <input type="text" id="choreAssignees" placeholder="Leave blank for entire house">
                            </div>
                            <div class="form-group">
                                <label>Priority Level *</label>
                                <select id="chorePriority" required>
                                    <option value="Low">🟢 Low</option>
                                    <option value="Medium">🟡 Medium</option>
                                    <option value="High">🟠 High</option>
                                    <option value="Urgent">🔴 Urgent</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Description & Instructions *</label>
                            <textarea id="choreDescription" rows="3" placeholder="Detailed instructions for the chore..." required></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Deadline *</label>
                                <input type="datetime-local" id="choreDeadline" required>
                            </div>
                            <div class="form-group">
                                <label>Points Reward</label>
                                <input type="number" id="chorePoints" value="10" min="1" max="100">
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" onclick="createChore()" class="btn btn-primary">Create Chore Assignment</button>
                            <button type="button" onclick="clearChoreForm()" class="btn btn-secondary">Clear Form</button>
                        </div>
                    </div>
                </div>

                <!-- Current Chore Assignments & Status -->
                <div class="form-section">
                    <h3>📋 Current Chore Assignments</h3>
                    <div class="chore-cards-container">
                        <div class="chore-card urgent">
                            <div class="chore-header">
                                <h4>🚨 Deep Kitchen Clean</h4>
                                <span class="priority-badge urgent">Urgent</span>
                            </div>
                            <div class="chore-details">
                                <p><strong>House:</strong> Widdersdorf 1</p>
                                <p><strong>Assigned to:</strong> Thomas, Max</p>
                                <p><strong>Deadline:</strong> Today 8:00 PM</p>
                                <p><strong>Description:</strong> Complete deep clean including appliances, floors, and all surfaces</p>
                            </div>
                            <div class="chore-actions">
                                <button onclick="markChoreComplete('kitchen-clean')" class="btn btn-success">Mark Complete</button>
                                <button onclick="extendDeadline('kitchen-clean')" class="btn btn-secondary">Extend Deadline</button>
                            </div>
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
                                    <h4>Marco Schmidt</h4>
                                    <span class="player-position">Midfielder</span>
                                    <span class="player-status status-active">Active</span>
                                </div>
                                <div class="player-actions">
                                    <button class="btn-small" onclick="editPlayer('marco-schmidt')">✏️ Edit</button>
                                    <button class="btn-small btn-warning" onclick="suspendPlayer('marco-schmidt')">⚠️ Suspend</button>
                                </div>
                            </div>
                            <div class="player-details">
                                <p><strong>Age:</strong> 19 • <strong>Nationality:</strong> Germany</p>
                                <p><strong>House:</strong> Widdersdorf 1 • <strong>Room:</strong> 12A</p>
                                <p><strong>Contract:</strong> 2024-2026 • <strong>Performance:</strong> 8.2/10</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- User Management Section -->
                <div id="user-management" class="admin-section">
                    <h2>User Management & Access Control</h2>
                    
                    <!-- Active Users List -->
                    <div class="form-section">
                        <h3>Current Users</h3>
                        <div class="users-list">
                            <div class="user-item">
                                <div class="user-info">
                                    <h4>Max Bisinger</h4>
                                    <p>Administrator • Last active: 5 minutes ago</p>
                                </div>
                                <div class="user-status active">Active</div>
                                <div class="user-actions">
                                    <button class="btn-small">Edit</button>
                                    <button class="btn-small btn-warning">Suspend</button>
                                </div>
                            </div>
                        </div>
                    </div>
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
                                <button class="btn btn-warning" onclick="lockdownMode()">🚨 System Lockdown Mode</button>
                            </div>
                        </div>
                    </div>
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
                <h1>🏠 Housing & Chore Management</h1>
                
                <!-- Admin/Staff Chore Creation -->
                <div class="admin-staff-only form-section" style="display: none;">
                    <h3>➕ Create New Chore Assignment</h3>
                    <div class="chore-creation-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Chore Title *</label>
                                <input type="text" id="choreTitle" placeholder="e.g., Clean Kitchen" required>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Calendar Page -->
            <div id="calendar" class="page">
                <h1>📅 Team Calendar & Events</h1>
                <div class="form-section">
                    <h3>Upcoming Events</h3>
                    <div class="event-list">
                        <div class="event-item">
                            <div class="event-date">Today</div>
                            <div class="event-details">
                                <h4>Training Session</h4>
                                <p>3:00 PM - 5:00 PM • Training Ground A</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Food Orders Page -->
            <div id="food-orders" class="page">
                <h1>🛒 Individual Food Orders</h1>
                
                <!-- Player vs Admin View Toggle -->
                <div class="form-section" id="orderViewToggle" style="display: none;">
                    <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                        <button onclick="showPlayerOrdering()" class="btn btn-primary" id="playerOrderBtn">My Orders</button>
                        <button onclick="showAdminSummary()" class="btn" id="adminSummaryBtn">House Summaries</button>
                    </div>
                </div>

                <!-- Delivery Schedule & Deadlines -->
                <div class="form-section">
                    <h3>📅 Delivery Schedule & Order Deadlines</h3>
                    <div class="delivery-schedule">
                        <div class="delivery-day">
                            <h4>Tuesday Deliveries</h4>
                            <p>Order by: Monday 6:00 PM</p>
                            <p>Delivery: Tuesday 6:00-8:00 PM</p>
                        </div>
                        <div class="delivery-day">
                            <h4>Friday Deliveries</h4>
                            <p>Order by: Thursday 6:00 PM</p>
                            <p>Delivery: Friday 6:00-8:00 PM</p>
                        </div>
                    </div>
                </div>

                <!-- Player Individual Ordering Section -->
                <div id="playerOrderingSection" class="form-section">
                    <h3>🛒 Place Your Individual Order</h3>
                    
                    <!-- Weekly Budget Display -->
                    <div class="budget-display">
                        <div class="budget-info">
                            <span class="budget-label">Weekly Food Budget:</span>
                            <div class="budget-amount" id="playerBudgetTotal">€75.00</div>
                            <div class="budget-remaining" id="playerBudgetRemaining">€50.00 remaining</div>
                        </div>
                    </div>
                    
                    <!-- Food Categories for Individual Ordering -->
                    <div class="grocery-categories" id="individualFoodCatalog">
                        <div class="category-section">
                            <h4 class="category-title">🥬 Vegetables & Fruits</h4>
                            <div class="items-grid" id="vegetables-items"></div>
                        </div>
                        <div class="category-section">
                            <h4 class="category-title">🥩 Meat & Protein</h4>
                            <div class="items-grid" id="meat-items"></div>
                        </div>
                        <div class="category-section">
                            <h4 class="category-title">🧀 Dairy Products</h4>
                            <div class="items-grid" id="dairy-items"></div>
                        </div>
                        <div class="category-section">
                            <h4 class="category-title">🍞 Carbohydrates</h4>
                            <div class="items-grid" id="carbs-items"></div>
                        </div>
                        <div class="category-section">
                            <h4 class="category-title">🥤 Drinks</h4>
                            <div class="items-grid" id="drinks-items"></div>
                        </div>
                        <div class="category-section">
                            <h4 class="category-title">🍿 Snacks</h4>
                            <div class="items-grid" id="snacks-items"></div>
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn btn-secondary" onclick="clearPlayerCart()">Clear Cart</button>
                        <button class="btn btn-primary" onclick="submitPlayerOrder()" id="submitPlayerOrderBtn">Place Order (€0.00)</button>
                    </div>
                </div>

                <!-- Admin House Summary Section -->
                <div id="adminSummarySection" class="form-section" style="display: none;">
                    <h3>📊 House Order Summaries</h3>
                    <div id="houseSummaries">
                        <div class="house-summary-tabs">
                            <button onclick="showHouseSummary('Widdersdorf 1')" class="house-tab active" id="w1-tab">Widdersdorf 1</button>
                            <button onclick="showHouseSummary('Widdersdorf 2')" class="house-tab" id="w2-tab">Widdersdorf 2</button>
                            <button onclick="showHouseSummary('Widdersdorf 3')" class="house-tab" id="w3-tab">Widdersdorf 3</button>
                        </div>
                        <div id="houseSummaryContent"></div>
                    </div>
                </div>

                <!-- Individual Orders History -->
                <div class="form-section">
                    <h3>📦 Your Order History</h3>
                    <div id="playerOrderHistory">
                        <div class="order-card pending">
                            <div class="order-header">
                                <h4>Tuesday Delivery - July 30</h4>
                                <span class="status-badge pending">Submitted</span>
                            </div>
                            <div class="order-details">
                                <p>3 items • Total: €12.47</p>
                                <p>Delivery: Tuesday 6-8 PM to Widdersdorf 1</p>
                            </div>
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

                <!-- Player Management Section -->
                <div id="player-management" class="admin-section active">
                    <h2>Player Management & Editing</h2>
                    
                    <!-- Player Search and Filters -->
                    <div class="admin-controls">
                        <div class="search-bar">
                            <input type="text" id="playerSearch" placeholder="Search players..." class="form-control">
                            <button class="btn" onclick="searchPlayers()">🔍 Search</button>
                        </div>
                    </div>

                    <!-- Players Admin Grid -->
                    <div class="players-admin-grid">
                        <div class="player-admin-card">
                            <div class="player-header">
                                <img src="https://via.placeholder.com/60x60" alt="Player" class="player-avatar">
                                <div class="player-info">
                                    <h4>Marco Schmidt</h4>
                                    <span class="player-position">Midfielder</span>
                                    <span class="player-status status-active">Active</span>
                                </div>
                                <div class="player-actions">
                                    <button class="btn-small" onclick="editPlayer('marco-schmidt')">✏️ Edit</button>
                                    <button class="btn-small btn-warning" onclick="suspendPlayer('marco-schmidt')">⚠️ Suspend</button>
                                </div>
                            </div>
                            <div class="player-details">
                                <p><strong>Age:</strong> 19 • <strong>Nationality:</strong> Germany</p>
                                <p><strong>House:</strong> Widdersdorf 1 • <strong>Room:</strong> 12A</p>
                                <p><strong>Contract:</strong> 2024-2026 • <strong>Performance:</strong> 8.2/10</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- JavaScript Functions -->
    <script>
        let currentUser = null;
        let choreStorage = [];
        
        // Player data storage - cleared per user request
        let playerStorage = [
            // Test player for preview and testing purposes
            {
                id: 'PLR001',
                firstName: 'Marco',
                lastName: 'Schmidt',
                age: 19,
                position: 'midfielder',
                nationality: 'Germany',
                house: 'Widdersdorf 1',
                room: '12A',
                status: 'active',
                contractPeriod: '2024-2026',
                joinDate: '2024-01-15',
                phoneNumber: '+49 221 555 0123',
                emergencyContact: 'Hans Schmidt (Father) - +49 221 555 0124',
                medicalInfo: 'No known allergies, previous knee injury (recovered)',
                specialNotes: 'Team captain material, excellent leadership skills',
                registrationEmail: 'marco.schmidt@example.com',
                // Performance statistics
                trainingAttendance: 95,
                matchPerformance: 88,
                physicalFitness: 92,
                technicalSkills: 85,
                teamwork: 94,
                discipline: 98
            }
        ];

        // Authentication functions
        window.showAuthTab = function(tab) {
            const loginTab = document.getElementById('loginTab');
            const registerTab = document.getElementById('registerTab');
            const forgotTab = document.getElementById('forgotTab');
            const loginForm = document.getElementById('loginForm');
            const registrationForm = document.getElementById('registrationForm');
            const forgotPasswordForm = document.getElementById('forgotPasswordForm');

            // Reset all tabs and forms
            [loginTab, registerTab, forgotTab].forEach(t => t.classList.remove('active'));
            [loginForm, registrationForm, forgotPasswordForm].forEach(f => f.style.display = 'none');

            // Show selected tab and form
            if (tab === 'login') {
                loginTab.classList.add('active');
                loginForm.style.display = 'block';
            } else if (tab === 'register') {
                registerTab.classList.add('active');
                registrationForm.style.display = 'block';
            } else if (tab === 'forgot') {
                forgotTab.classList.add('active');
                forgotPasswordForm.style.display = 'block';
            }
        };

        // Login functionality - wrapped in DOMContentLoaded to ensure elements exist
        document.addEventListener('DOMContentLoaded', function() {
            // Login form submission
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    const messageDiv = document.getElementById('loginMessage');
                    
                    // Hardcoded credentials for admin and staff
                    if ((email === 'max.bisinger@warubi-sports.com' && password === 'ITP2024') ||
                        (email === 'thomas.ellinger@warubi-sports.com' && password === 'ITP2024')) {
                        
                        currentUser = {
                            email: email,
                            role: email.includes('max.bisinger') ? 'admin' : 'staff',
                            name: email.includes('max.bisinger') ? 'Max Bisinger' : 'Thomas Ellinger',
                            loginTime: new Date().toISOString()
                        };
                        
                        // Store authentication in localStorage
                        localStorage.setItem('fc-koln-auth', JSON.stringify({ user: currentUser }));
                        showMainApp();
                    } else {
                        messageDiv.innerHTML = '<div class="error-message">Invalid credentials. Please try again.</div>';
                    }
                });
            }
        });

        function showMainApp() {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            
            // Update user info in header
            const userNameEl = document.getElementById('userName');
            const userRoleEl = document.getElementById('userRole');
            if (userNameEl && currentUser) {
                userNameEl.textContent = currentUser.name;
                userRoleEl.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
            }
            
            // Show admin-only elements if admin
            if (currentUser && currentUser.role === 'admin') {
                const adminElements = document.querySelectorAll('.admin-only');
                adminElements.forEach(el => el.style.display = 'block');
                
                const orderToggle = document.getElementById('orderViewToggle');
                if (orderToggle) orderToggle.style.display = 'block';
            }
            
            // Show admin/staff elements for both admin and staff
            if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff')) {
                const adminStaffElements = document.querySelectorAll('.admin-staff-only');
                adminStaffElements.forEach(el => el.style.display = 'block');
            }
            
            // Initialize dashboard
            showPage('dashboard');
        }

        // Page navigation function
        window.showPage = function(pageId) {
            // Hide all pages
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.style.display = 'none');
            
            // Remove active class from all nav items
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            
            // Show selected page
            const selectedPage = document.getElementById(pageId);
            if (selectedPage) {
                selectedPage.style.display = 'block';
            }
            
            // Add active class to corresponding nav item
            const activeNavItem = document.querySelector('[onclick*="showPage(\'' + pageId + '\')"]');
            if (activeNavItem) {
                activeNavItem.classList.add('active');
            }
        };

        // Logout function
        window.logout = function() {
            currentUser = null;
            localStorage.removeItem('fc-koln-auth');
            document.getElementById('loginPage').style.display = 'block';
            document.getElementById('mainApp').style.display = 'none';
            
            // Reset form
            document.getElementById('email').value = 'max.bisinger@warubi-sports.com';
            document.getElementById('password').value = 'ITP2024';
            document.getElementById('loginMessage').innerHTML = '';
        };

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
                    logout();
                }
            }
        });

        // Initialize application
        console.log('1.FC Köln Bundesliga Talent Program loaded successfully');
        console.log('Complete application with Dashboard, Players, Chores, Calendar, Food Orders, Communications, House Management, and Admin');
        console.log('Enhanced features initialized successfully');
        console.log('Admin player editing functionality loaded');
    </script>

    <!-- Player Edit Modal -->
    <div id="playerEditModal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Player Information</h3>
                <span class="close" onclick="closePlayerEditModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-section">
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
                </div>
            </div>
        </div>
    </div>

</body>
</html>
`;

// HTTP Server Setup
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
