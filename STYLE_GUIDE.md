# FC Köln Management System - Style Guide

## Overview
This document establishes the design system and coding standards for the FC Köln Bundesliga Talent Program Management System. Following these guidelines ensures consistency, maintainability, and professional quality across all future development.

## Design System

### Color Palette
```css
/* Primary Brand Colors */
--fc-koln-red: #dc143c;
--fc-koln-red-dark: #b91c3c;
--fc-koln-red-light: #fef2f2;

/* Neutral Colors */
--slate-900: #1e293b;
--slate-600: #64748b;
--slate-100: #f8fafc;
--slate-50: #fafafa;

/* Utility Colors */
--border-light: #e2e8f0;
--shadow-color: rgba(0, 0, 0, 0.08);
```

### Typography Scale
```css
/* Headers */
--text-2xl: 1.75rem;    /* Main page headers */
--text-xl: 1.625rem;    /* Chat headers */
--text-lg: 1.1rem;      /* Important text */

/* Body Text */
--text-base: 1rem;      /* Standard text */
--text-sm: 0.9rem;      /* Secondary text */
--text-xs: 0.85rem;     /* Helper text */
```

### Spacing System
```css
/* Luxury Spacing Standards */
--space-6: 3rem;        /* Major sections, headers */
--space-5: 2.5rem;      /* Input containers */
--space-4: 2rem;        /* Content areas */
--space-3: 1.5rem;      /* Elements */
--space-2: 1rem;        /* Small elements */
```

### Border Radius
```css
--radius-xl: 20px;      /* Containers */
--radius-lg: 16px;      /* Cards */
--radius-md: 12px;      /* Buttons */
--radius-full: 50%;     /* Circular buttons */
```

## Component Standards

### Buttons
```css
/* Primary Button */
.btn-primary {
    min-height: 56px;
    padding: 1rem 2rem;
    font-size: 1rem;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, var(--fc-koln-red) 0%, var(--fc-koln-red-dark) 100%);
    transition: all 0.2s ease;
}

.btn-primary:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(220, 20, 60, 0.3);
}
```

### Cards
```css
.card {
    border-radius: var(--radius-lg);
    background: white;
    box-shadow: 0 4px 20px var(--shadow-color);
    border: 1px solid var(--border-light);
    padding: var(--space-4);
    transition: all 0.2s ease;
}

.card:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 32px var(--shadow-color);
}
```

### Forms
```css
.form-input {
    padding: 1.125rem 1.5rem;
    border: 2px solid var(--border-light);
    border-radius: var(--radius-lg);
    font-size: 1rem;
    background: var(--slate-100);
    transition: all 0.2s ease;
}

.form-input:focus {
    outline: none;
    border-color: var(--fc-koln-red);
    background: white;
    box-shadow: 0 0 0 3px rgba(220, 20, 60, 0.1);
}
```

## Layout Guidelines

### Container Specifications
- **Main Interfaces**: 90vh height, 800px minimum
- **Sidebars**: 380-420px width for comfortable navigation
- **Content Areas**: 3rem padding for luxury spacing
- **Mobile**: Scale down to 1.5rem padding, maintain vertical spacing

### Grid Systems
- Use CSS Grid for complex layouts
- Flexbox for simple alignments
- Always consider mobile-first responsive design

## Animation Standards

### Hover Effects
```css
/* Standard hover scale */
transform: scale(1.05);
transition: all 0.2s ease;

/* Button press feedback */
transform: scale(0.95);
```

### Loading Animations
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

### State Transitions
- Use 0.2s ease for most transitions
- Color changes should be smooth
- Shadow adjustments for depth perception

## Code Organization

### File Structure
```
fc-koln-stable-permanent.js     # Main application file
auth-core.js                    # Authentication system (DO NOT MODIFY)
system-monitor.js               # System integrity (DO NOT MODIFY)
features-module.js              # Isolated features
replit.md                       # Project documentation
STYLE_GUIDE.md                  # This file
```

### CSS Organization
1. **Global Styles**: Typography, colors, base elements
2. **Layout Components**: Headers, sidebars, containers
3. **Feature Styles**: Specific functionality (communications, chores, etc.)
4. **Responsive Styles**: Mobile adjustments
5. **Animations**: Keyframes and transitions

## Quality Assurance

### Pre-Commit Checklist
- [ ] Spacing follows luxury standards (3rem headers, 2rem content)
- [ ] Typography uses established scale
- [ ] Colors match FC Köln brand guidelines
- [ ] Animations are smooth (0.2s ease)
- [ ] Mobile responsiveness maintained
- [ ] Authentication system unchanged
- [ ] Performance impact considered

### Testing Requirements
- Test on mobile devices (360px+ width)
- Verify hover states and animations
- Check color contrast ratios
- Validate responsive breakpoints

## Development Workflow

### Adding New Features
1. **Design First**: Follow established patterns
2. **Mobile First**: Start with smallest screen
3. **Progressive Enhancement**: Add desktop luxuries
4. **Test Thoroughly**: All screen sizes and interactions
5. **Document Changes**: Update replit.md with significant changes

### Modification Guidelines
- Never modify auth-core.js or system-monitor.js
- Maintain established spacing standards
- Use consistent naming conventions
- Follow luxury spacing philosophy
- Preserve FC Köln branding integrity

## Performance Considerations

### CSS Optimization
- Use CSS custom properties for maintainability
- Minimize layout thrashing with transform/opacity animations
- Leverage GPU acceleration for smooth animations
- Consider critical CSS for above-the-fold content

### JavaScript Best Practices
- Event delegation for dynamic content
- Debounce user inputs where appropriate
- Lazy load non-critical features
- Maintain clean separation of concerns

---

**Last Updated**: August 14, 2025
**Version**: 1.0
**Maintainer**: FC Köln Development Team