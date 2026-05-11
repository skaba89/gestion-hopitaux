# =============================================================================
# HealthFlow Guinea - Apache Superset Configuration
# Custom configuration for hospital information system analytics
# =============================================================================

import os
from datetime import timedelta

# =============================================================================
# Core Configuration
# =============================================================================

# Secret key for signing cookies and CSRF protection
# MUST be changed in production - generate with: openssl rand -base64 42
SECRET_KEY = os.environ.get(
    "SUPERSET_SECRET_KEY",
    "CHANGE_ME_GENERATE_WITH_OPENSSL_RAND_BASE64_42"
)

# Flask App Builder configuration
APP_NAME = "HealthFlow Analytics"
APP_ICON = "/static/assets/images/healthflow-logo.png"

# =============================================================================
# Database Configuration
# =============================================================================

# Superset metadata database (internal)
SQLALCHEMY_DATABASE_URI = os.environ.get(
    "DATABASE_URI",
    "postgresql://healthflow:healthflow_secret@postgres:5432/superset?schema=public"
)

# Connection to HealthFlow application database (read-only analytics)
HEALTHFLOW_DB_URI = os.environ.get(
    "HEALTHFLOW_DATABASE_URI",
    "postgresql://healthflow:healthflow_secret@postgres:5432/healthflow?schema=public"
)

# SQL Alchemy pool settings
SQLALCHEMY_POOL_SIZE = 10
SQLALCHEMY_POOL_RECYCLE = 3600
SQLALCHEMY_POOL_PRE_PING = true  # noqa: E712
SQLALCHEMY_TRACK_MODIFICATIONS = False

# =============================================================================
# Redis & Celery Configuration
# =============================================================================

REDIS_URL = os.environ.get("REDIS_URL", "redis://redis:6379/1")

# Celery configuration for async reports and alerts
class CeleryConfig:  # noqa: D101
    broker_url = REDIS_URL
    result_backend = REDIS_URL
    imports = (
        "superset.sql_lab",
        "superset.tasks.scheduler",
        "superset.tasks.cache",
    )
    task_annotations = {
        "sql_lab.get_sql_results": {"rate_limit": "100/s"},
        "email_reports.send": {"rate_limit": "1/s", "time_limit": 120, "soft_time_limit": 150},
    }
    beat_schedule = {
        "reports.scheduler": {
            "task": "reports.scheduler",
            "schedule": timedelta(minutes=5),
        },
        "reports.prune_log": {
            "task": "reports.prune_log",
            "schedule": timedelta(days=1),
        },
    }

CELERY_CONFIG = CeleryConfig
RESULTS_BACKEND = RedisCache(redis_url=REDIS_URL, key_prefix="superset_results")  # noqa: F821

# =============================================================================
# Cache Configuration
# =============================================================================

CACHE_CONFIG = {
    "CACHE_TYPE": "redis",
    "CACHE_DEFAULT_TIMEOUT": 300,
    "CACHE_KEY_PREFIX": "superset_cache_",
    "CACHE_REDIS_URL": REDIS_URL,
}

DATA_CACHE_CONFIG = {
    "CACHE_TYPE": "redis",
    "CACHE_DEFAULT_TIMEOUT": 86400,  # 24 hours for chart data
    "CACHE_KEY_PREFIX": "superset_data_",
    "CACHE_REDIS_URL": REDIS_URL,
}

FILTER_STATE_CACHE_CONFIG = {
    "CACHE_TYPE": "redis",
    "CACHE_DEFAULT_TIMEOUT": 86400,
    "CACHE_KEY_PREFIX": "superset_filter_",
    "CACHE_REDIS_URL": REDIS_URL,
}

EXPLORE_FORM_DATA_CACHE_CONFIG = {
    "CACHE_TYPE": "redis",
    "CACHE_DEFAULT_TIMEOUT": 86400,
    "CACHE_KEY_PREFIX": "superset_explore_",
    "CACHE_REDIS_URL": REDIS_URL,
}

# =============================================================================
# Feature Flags
# =============================================================================

FEATURE_FLAGS = {
    "ALERT_REPORTS": True,
    "DASHBOARD_CACHE": True,
    "DASHBOARD_NATIVE_FILTERS": True,
    "DASHBOARD_NATIVE_FILTERS_SET": True,
    "DASHBOARD_CROSS_FILTERS": True,
    "GLOBAL_ASYNC_QUERIES": True,
    "VERSIONED_EXPORT": True,
    "EMBEDDED_SUPERSET": False,
    "ROW_LEVEL_SECURITY": True,
    "ESTIMATE_QUERY_COST": True,
    "SQL_VALIDATORS_BY_ENGINE": True,
    "DASHBOARD_RBAC": True,
    "OMNIBAR": True,
    "CLIENT_CACHE": True,
    "SHARE_QUERIES_VIA_KV_STORE": True,
}

# =============================================================================
# Security & Authentication
# =============================================================================

# Authentication type
AUTH_TYPE = 1  # AUTH_DB (database authentication)

# Row Level Security for multi-establishment (hospital) data isolation
# This ensures each establishment can only see its own data
ROW_LEVEL_SECURITY_ENABLED = True

# Custom role for health workers per establishment
CUSTOM_SECURITY_MANAGER = None  # Override with HealthFlowSecurityManager if needed

# Session configuration
SESSION_COOKIE_SECURE = True  # HTTPS only
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
PERMANENT_SESSION_LIFETIME = timedelta(hours=12)

# CSRF protection
WTF_CSRF_ENABLED = True
WTF_CSRF_TIME_LIMIT = None  # No time limit on CSRF tokens

# =============================================================================
# HealthFlow Custom Charts & Dashboards
# =============================================================================

# Custom visualization plugins for health data
# These map to specific health metrics and chart types

# Pre-configured dashboard slugs
DASHBOARD_SLUGS = {
    "epidemiological-surveillance": "Surveillance Épidémiologique",
    "hospital-operations": "Opérations Hospitalières",
    "maternal-health": "Santé Maternelle",
    "pharmacy-inventory": "Inventaire Pharmacie",
    "financial-overview": "Aperçu Financier",
    "vaccination-coverage": "Couverture Vaccinale",
    "emergency-triage": "Triage Urgences",
    "lab-performance": "Performance Laboratoire",
}

# Custom chart configurations for health-specific visualizations
CUSTOM_CHART_CONFIGS = {
    # Epidemiological curve (weekly case counts)
    "epi_curve": {
        "chart_type": "area",
        "time_column": "date",
        "metric": "case_count",
        "groupby": "disease",
        "color_scheme": "supersetColors",
    },
    # Triage distribution (5-color French system)
    "triage_distribution": {
        "chart_type": "pie",
        "metric": "case_count",
        "groupby": "triage_level",
        "color_scheme": {
            "RED": "#DC2626",     # Absolu
            "ORANGE": "#EA580C",  # Urgent
            "YELLOW": "#CA8A04",  # Semi-urgent
            "GREEN": "#16A34A",   # Moins urgent
            "BLUE": "#2563EB",    # Non urgent
        },
    },
    # Bed occupancy rate by department
    "bed_occupancy": {
        "chart_type": "bar",
        "metric": "occupancy_rate",
        "groupby": "department",
        "color_scheme": "lyftColors",
    },
    # Vaccination coverage by vaccine type
    "vaccination_coverage": {
        "chart_type": "gauge",
        "metric": "coverage_rate",
        "groupby": "vaccine_type",
        "target": 0.90,  # 90% WHO target
    },
    # Revenue by service
    "revenue_by_service": {
        "chart_type": "treemap",
        "metric": "sum_amount",
        "groupby": ["service", "payment_category"],
        "currency": "GNF",
    },
    # Disease surveillance heatmap
    "disease_heatmap": {
        "chart_type": "heatmap",
        "x_axis": "week_number",
        "y_axis": "disease",
        "metric": "case_count",
        "color_scheme": "red_yellow_green",
    },
}

# =============================================================================
# Database Connection Definitions (HealthFlow Analytics Sources)
# =============================================================================

# Additional database connections available to Superset users
# These are registered as database sources for building dashboards

ADDITIONAL_DATABASES = [
    {
        "name": "HealthFlow Production",
        "sqlalchemy_uri": HEALTHFLOW_DB_URI,
        "cache_timeout": 300,
        "expose_in_sqllab": True,
        "allow_run_async": True,
        "allow_ctas": False,
        "allow_cvas": False,
        "allow_dml": False,  # Read-only access to production data
        "impersonate_user": False,
        "extra": """
        {
            "metadata_params": {},
            "engine_params": {
                "connect_args": {
                    "application_name": "HealthFlow_Superset",
                    "options": "-c statement_timeout=30000"
                }
            },
            "metadata_cache_timeout": {},
            "schemas_allowed_for_csv_upload": []
        }
        """,
    },
]

# =============================================================================
# UI Customization
# =============================================================================

# Language and locale
BABEL_DEFAULT_LOCALE = "fr"
LANGUAGES = {
    "fr": {"flag": "gn", "name": "Français"},
    "en": {"flag": "us", "name": "English"},
}

# Theme customization
THEME_OVERRIDES = {
    "borderRadius": 4,
    "colors": {
        "primary": {
            "base": "#0D9488",       # Teal-600 (HealthFlow brand)
            "dark1": "#0F766E",      # Teal-700
            "dark2": "#115E59",      # Teal-800
            "light1": "#14B8A6",     # Teal-500
            "light2": "#2DD4BF",     # Teal-400
            "light3": "#5EEAD4",     # Teal-300
            "light4": "#99F6E4",     # Teal-200
            "light5": "#CCFBF1",     # Teal-100
        },
        "secondary": {
            "base": "#059669",       # Emerald-600
            "dark1": "#047857",      # Emerald-700
            "light1": "#10B981",     # Emerald-500
        },
        "success": "#059669",
        "warning": "#D97706",
        "error": "#DC2626",
        "info": "#0891B2",
    },
    "typography": {
        "families": {
            "sans": ["Inter", "Helvetica Neue", "Arial", "sans-serif"],
            "mono": ["JetBrains Mono", "Consolas", "monospace"],
        },
    },
}

# =============================================================================
# Logging & Monitoring
# =============================================================================

# Logging configuration
LOG_FORMAT = "%(asctime)s:%(levelname)s:%(name)s:%(message)s"
LOG_LEVEL = "INFO"

# Enable Sentry integration (optional)
SENTRY_DSN = os.environ.get("SENTRY_DSN", "")

# =============================================================================
# Email & Notifications (for scheduled reports)
# =============================================================================

SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.example.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_STARTTLS = True
SMTP_SSL = False
SMTP_USER = os.environ.get("SMTP_USER", "notifications@healthflow.gn")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
SMTP_MAIL_FROM = os.environ.get("SMTP_FROM", "analytics@healthflow.gn")

# Alert notification settings
ALERT_REPORTS_NOTIFICATION_DRY_RUN = False
WEBDRIVER_BASEURL = "http://superset:8088"
WEBDRIVER_BASEURL_USER_FRIENDLY = os.environ.get("NEXTAUTH_URL", "https://healthflow.gn/analytics")

# =============================================================================
# Performance & Limits
# =============================================================================

# SQL Lab settings
SQLLAB_TIMEOUT = 60  # seconds
SQLLAB_ASYNC_TIME_LIMIT_SEC = 300  # 5 minutes
SQLLAB_CTAS_NO_LIMIT = False

# Query limits
DEFAULT_SQLLAB_LIMIT = 10000
SQL_MAX_ROW = 100000
DISPLAY_MAX_ROW = 10000

# Superstar query limits
SUPERSET_WEBSERVER_TIMEOUT = 300

# =============================================================================
# Data Download & Export
# =============================================================================

# CSV export settings
CSV_EXPORT = {
    "encoding": "utf-8",
}

# Maximum payload size for queries
MAX_PAYLOAD_LENGTH = 10000  # bytes for ad-hoc queries

# =============================================================================
# Health Check Endpoint
# =============================================================================

# Superset provides /health endpoint by default
# Verify it's accessible at http://superset:8088/health
