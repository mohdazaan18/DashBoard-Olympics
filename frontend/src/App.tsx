import { useEffect, useState } from 'react';
import { Filters } from './types';
import { useFilterOptions } from './hooks/useFilterOptions';
import { Sidebar } from './components/ui/Sidebar';
import { MedalsByCountryChart } from './components/charts/MedalsByCountryChart';
import { MedalTrendChart } from './components/charts/MedalTrendChart';
import { GenderOverTimeChart } from './components/charts/GenderOverTimeChart';
import { PhysicalBySportChart } from './components/charts/PhysicalBySportChart';
import { SportParticipationChart } from './components/charts/SportParticipationChart';
import { AgeDistributionChart } from './components/charts/AgeDistributionChart';
import { CountrySportHeatmap } from './components/charts/CountrySportHeatmap';

// ─── ChartCard ──────────────────────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="chart-container">
      <div style={{ marginBottom: 10 }}>
        <div className="chart-title">{title}</div>
        <div className="chart-subtitle">{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  iconBg,
  value,
  label,
  sub,
}: {
  icon: string;
  iconBg: string;
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="stat-tile">
      <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && (
          <div style={{ fontSize: 10, color: 'var(--success)', marginTop: 2, fontWeight: 500 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Grid helpers ─────────────────────────────────────────────────────────────
const row2: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  marginBottom: 12,
  alignItems: 'stretch',
};
const row2asym: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.25fr 1fr',
  gap: 12,
  marginBottom: 12,
  alignItems: 'stretch',
};
const row1: React.CSSProperties = { marginBottom: 12 };

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [filters, setFilters] = useState<Filters>({});
  const filterOptions = useFilterOptions();

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('olympic-theme') as 'dark' | 'light') ?? 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('olympic-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div className="app-shell">
      <Sidebar
        filters={filters}
        options={filterOptions}
        onChange={setFilters}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <main className="main-content">
        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
          <StatCard icon="🏅" iconBg="rgba(255,214,10,0.15)" value="271K" label="Total Records" sub="↑ 120 years of data" />
          <StatCard icon="🌍" iconBg="rgba(10,132,255,0.15)" value="230+" label="Nations Competed" />
          <StatCard icon="⚽" iconBg="rgba(48,209,88,0.15)" value="66" label="Olympic Sports" />
          <StatCard icon="🏋" iconBg="rgba(255,159,10,0.15)" value="1896–2016" label="Year Span" sub="120 years" />
        </div>

        {/* Row 1: Medal tally + trend */}
        <div style={row2}>
          <ChartCard title="Medal Tally by Nation" subtitle="Top 15 countries — stacked by medal type">
            <MedalsByCountryChart filters={filters} />
          </ChartCard>
          <ChartCard title="Medal Production Over Time" subtitle="How total Olympic medals evolved across editions">
            <MedalTrendChart filters={filters} />
          </ChartCard>
        </div>

        {/* Row 2: Gender + Participation */}
        <div style={row2asym}>
          <ChartCard title="Gender Participation Shift" subtitle="Male vs Female athletes — the long march to equality">
            <GenderOverTimeChart filters={filters} />
          </ChartCard>
          <ChartCard title="Sport Participation Volume" subtitle="Top 25 sports by total athlete appearances">
            <SportParticipationChart filters={filters} />
          </ChartCard>
        </div>

        {/* Row 3: Age + Physical */}
        <div style={row2}>
          <ChartCard title="Age Distribution" subtitle="Filter by sport — gymnasts vs weightlifters tell very different stories.">
            <AgeDistributionChart filters={filters} />
          </ChartCard>
          <ChartCard title="Athlete Body Profile by Sport" subtitle="Average height vs weight — bubble size = sample size.">
            <PhysicalBySportChart filters={filters} />
          </ChartCard>
        </div>

        {/* Row 4: Country × Sport Heatmap */}
        <div style={row1}>
          <ChartCard title="Country × Sport Dominance" subtitle="Where each nation concentrates its Olympic power — top 10 nations, top 10 sports.">
            <CountrySportHeatmap filters={filters} />
          </ChartCard>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 16, color: 'var(--text-3)', fontSize: 11 }}>
          Olympic Intelligence · 271,116 records · React + Highcharts + Express
        </div>
      </main>
    </div>
  );
}
