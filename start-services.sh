#!/bin/bash
# ============================================================================
# HealthFlow Guinea - Start Infrastructure Services
# PostgreSQL 17 + Redis 8
# ============================================================================

set -e

PGDIR=/home/z/my-project/pg-install
PGBIN=$PGDIR/usr/lib/postgresql/17/bin
PGDATA=/home/z/my-project/pg-data
PGPORT=5433
PGHOST=/tmp
LD_LIBRARY_PATH_PG=$PGDIR/usr/lib/x86_64-linux-gnu:$PGDIR/usr/lib/postgresql/17/lib

REDIS_BIN=/home/z/my-project/redis-install/usr/bin
REDIS_CONF=/home/z/my-project/redis-data/redis.conf
REDIS_PORT=6380
LD_LIBRARY_PATH_REDIS=/home/z/my-project/redis-install/usr/lib/x86_64-linux-gnu

echo "🏥 HealthFlow Guinea - Starting Infrastructure Services"
echo "========================================================"

# ---- Start PostgreSQL ----
echo ""
echo "📦 Starting PostgreSQL 17..."
if LD_LIBRARY_PATH=$LD_LIBRARY_PATH_PG $PGBIN/pg_isready -p $PGPORT -h $PGHOST &>/dev/null; then
  echo "   ✅ PostgreSQL already running on port $PGPORT"
else
  # Initialize if needed
  if [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "   🔧 Initializing PostgreSQL database cluster..."
    LD_LIBRARY_PATH=$LD_LIBRARY_PATH_PG $PGBIN/initdb -D $PGDATA --auth=trust --encoding=UTF8 --locale=C.UTF-8
  fi

  LD_LIBRARY_PATH=$LD_LIBRARY_PATH_PG $PGBIN/pg_ctl -D $PGDATA -l $PGDATA/server.log start
  sleep 2

  if LD_LIBRARY_PATH=$LD_LIBRARY_PATH_PG $PGBIN/pg_isready -p $PGPORT -h $PGHOST &>/dev/null; then
    echo "   ✅ PostgreSQL started on port $PGPORT"
  else
    echo "   ❌ Failed to start PostgreSQL. Check $PGDATA/server.log"
    exit 1
  fi

  # Create database if it doesn't exist
  if ! LD_LIBRARY_PATH=$LD_LIBRARY_PATH_PG $PGBIN/psql -p $PGPORT -h $PGHOST -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw healthflow; then
    echo "   🔧 Creating healthflow database..."
    LD_LIBRARY_PATH=$LD_LIBRARY_PATH_PG $PGBIN/createdb -p $PGPORT -h $PGHOST healthflow
    echo "   ✅ Database 'healthflow' created"
  fi
fi

# ---- Start Redis ----
echo ""
echo "📦 Starting Redis 8..."
REDIS_CLI="$REDIS_BIN/redis-cli"
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH_REDIS

if $REDIS_CLI -p $REDIS_PORT ping &>/dev/null; then
  echo "   ✅ Redis already running on port $REDIS_PORT"
else
  $REDIS_BIN/redis-server $REDIS_CONF 2>/dev/null
  sleep 1

  if $REDIS_CLI -p $REDIS_PORT ping &>/dev/null; then
    echo "   ✅ Redis started on port $REDIS_PORT"
  else
    echo "   ❌ Failed to start Redis. Check /home/z/my-project/redis-data/redis.log"
    exit 1
  fi
fi

echo ""
echo "========================================================"
echo "🎉 All infrastructure services are running!"
echo ""
echo "   PostgreSQL: localhost:$PGPORT (database: healthflow)"
echo "   Redis:      localhost:$REDIS_PORT"
echo ""
echo "Next steps:"
echo "   1. npx prisma migrate dev     # Run database migrations"
echo "   2. npx prisma db seed         # Seed demo data"
echo "   3. npm run dev                # Start the application"
echo "========================================================"
