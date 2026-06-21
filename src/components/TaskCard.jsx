import React from 'react';
import { Check, Star, Pencil } from 'lucide-react';

export function TaskCard({ task, onToggle, isAdmin, onEdit }) {
  return (
    <div
      className={`task-card ${task.completed ? 'completed' : ''}`}
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderLeft: `6px solid ${task.type === 'obligatory' ? 'var(--color-primary)' : 'var(--color-secondary)'}`,
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ textAlign: 'left', flex: 1 }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {task.title}
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              style={{
                background: 'none',
                padding: '4px',
                color: '#666',
                cursor: 'pointer',
                display: 'flex',
                borderRadius: '50%',
                border: '1px solid #ddd'
              }}
            >
              <Pencil size={14} />
            </button>
          )}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666' }}>
          <Star size={16} fill="var(--color-accent)" color="var(--color-accent)" />
          <span style={{ fontWeight: 'bold', color: 'var(--color-accent)' }}>{task.points} pts</span>
          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            • {task.type === 'obligatory' ? 'Obligatoria' : 'Extra'}
          </span>
        </div>
      </div>

      <button
        onClick={() => onToggle(task.id)}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '3px solid var(--color-secondary)',
          backgroundColor: task.completed ? 'var(--color-secondary)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        {task.completed && <Check size={32} strokeWidth={3} />}
      </button>
    </div>
  );
}
