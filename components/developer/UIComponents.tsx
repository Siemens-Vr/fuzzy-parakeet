// components/developer/UIComponents.tsx
'use client';

import { ReactNode, CSSProperties } from 'react';

// ===== Button Component =====
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: ReactNode;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  icon,
}: ButtonProps) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const variantClass = `btn-${variant}`;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

// ===== Card Component =====
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`.trim()}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function CardHeader({ title, subtitle, actions }: CardHeaderProps) {
  return (
    <div className="card-header">
      <div>
        <h3 className="card-title">{title}</h3>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

// ===== Badge Component =====
interface BadgeProps {
  children: ReactNode;
  variant?: 'green' | 'yellow' | 'orange' | 'red' | 'gray' | 'blue';
}

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// ===== Alert Component =====
interface AlertProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  icon?: string;
  onClose?: () => void;
}

export function Alert({ children, variant = 'info', title, icon, onClose }: AlertProps) {
  const defaultIcons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div className={`alert alert-${variant}`}>
      <div className="alert-icon">{icon || defaultIcons[variant]}</div>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="alert-close">✕</button>
      )}
    </div>
  );
}

// ===== Form Components =====
interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export function FormGroup({ children, className = '' }: FormGroupProps) {
  return <div className={`form-group ${className}`.trim()}>{children}</div>;
}

interface LabelProps {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}

export function Label({ children, required = false, htmlFor }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={`label ${required ? 'label-required' : ''}`.trim()}>
      {children}
    </label>
  );
}

interface InputProps {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helper?: string;
  maxLength?: number;
  icon?: ReactNode;
}

export function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  helper,
  maxLength,
  icon,
}: InputProps) {
  return (
    <>
      {icon ? (
        <div className="input-icon">
          <span className="input-icon-prefix">{icon}</span>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className="input"
          />
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className="input"
        />
      )}
      {helper && !error && <div className="helper-text">{helper}</div>}
      {error && <div className="error-text">{error}</div>}
    </>
  );
}

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helper?: string;
  rows?: number;
  maxLength?: number;
}

export function Textarea({
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  helper,
  rows = 4,
  maxLength,
}: TextareaProps) {
  return (
    <>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className="textarea"
      />
      {helper && !error && <div className="helper-text">{helper}</div>}
      {error && <div className="error-text">{error}</div>}
    </>
  );
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  error,
}: SelectProps) {
  return (
    <>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="select"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div className="error-text">{error}</div>}
    </>
  );
}

// ===== Progress Bar =====
interface ProgressProps {
  value: number;
  max?: number;
  showText?: boolean;
}

export function Progress({ value, max = 100, showText = true }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${percentage}%` }} />
      </div>
      {showText && <div className="progress-text">{percentage.toFixed(0)}%</div>}
    </>
  );
}

// ===== Stats Card =====
interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: string;
    positive?: boolean;
  };
  icon?: string;
}

export function StatCard({ label, value, change, icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
        {label}
      </div>
      <div className="stat-value">{value}</div>
      {change && (
        <div className={`stat-change ${change.positive ? 'positive' : 'negative'}`}>
          <span>{change.positive ? '↑' : '↓'}</span>
          {change.value}
        </div>
      )}
    </div>
  );
}

// ===== Empty State =====
interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = '📭', title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      {message && <div className="empty-state-message">{message}</div>}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ===== Loading Spinner =====
interface SpinnerProps {
  size?: number;
}

export function Spinner({ size = 20 }: SpinnerProps) {
  return (
    <div
      className="spinner"
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

// ===== Table Components =====
interface TableProps {
  children: ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <div className="table-container">
      <table className="table">{children}</table>
    </div>
  );
}

interface TableHeaderProps {
  columns: string[];
}

export function TableHeader({ columns }: TableHeaderProps) {
  return (
    <thead>
      <tr>
        {columns.map((col, i) => (
          <th key={i}>{col}</th>
        ))}
      </tr>
    </thead>
  );
}

// ===== Tab Component =====
interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <>
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </>
  );
}

// ===== Stepper Component =====
interface Step {
  label: string;
  completed: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="stepper">
      {steps.map((step, index) => (
        <div key={index}>
          <div
            className={`stepper-item ${
              index < currentStep ? 'done' : index === currentStep ? 'current' : ''
            }`}
          >
            <div className="stepper-dot">{index < currentStep ? '' : index + 1}</div>
            <div className="stepper-label">{step.label}</div>
          </div>
          {index < steps.length - 1 && (
            <div className={`stepper-line ${index < currentStep ? 'done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ===== Grid Layouts =====
interface GridProps {
  children: ReactNode;
  columns?: number;
  gap?: string;
}

export function Grid({ children, columns = 2, gap = '20px' }: GridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {children}
    </div>
  );
}

// ===== Modal Component =====
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          <button onClick={onClose} className="btn btn-ghost">✕</button>
        </div>
        <div style={{ padding: '24px' }}>
          {children}
        </div>
        {footer && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Usage Examples =====
export function ComponentShowcase() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Buttons" />
        <div className="row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Badges" />
        <div className="row">
          <Badge variant="green">Success</Badge>
          <Badge variant="yellow">Warning</Badge>
          <Badge variant="orange">Pending</Badge>
          <Badge variant="red">Error</Badge>
          <Badge variant="blue">Info</Badge>
        </div>
      </Card>

      <Card>
        <CardHeader title="Alerts" />
        <div className="space-y-4">
          <Alert variant="success" title="Success">Operation completed successfully!</Alert>
          <Alert variant="warning" title="Warning">Please review before continuing.</Alert>
          <Alert variant="error" title="Error">An error occurred. Please try again.</Alert>
          <Alert variant="info" title="Info">This is some helpful information.</Alert>
        </div>
      </Card>

      <Card>
        <CardHeader title="Form Elements" />
        <div className="space-y-4">
          <FormGroup>
            <Label required>Email Address</Label>
            <Input
              type="email"
              value=""
              onChange={() => {}}
              placeholder="Enter your email"
              helper="We'll never share your email"
            />
          </FormGroup>

          <FormGroup>
            <Label>Message</Label>
            <Textarea
              value=""
              onChange={() => {}}
              placeholder="Enter your message"
              rows={4}
            />
          </FormGroup>
        </div>
      </Card>
    </div>
  );
}