import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentReplayIndex, setReplayPaused } from "../../features/replaySlice";
import { selectReplayData, selectReplayLoading, selectCurrentReplayIndex } from "../../features/replaySlice";

const columnDefs = [
  { label: '#', width: 70, align: 'left', key: null },
  { label: 'Status', width: 90, align: 'left', key: 'status' },
  { label: 'Speed', width: 60, align: 'right', key: 'speed' },
  { label: 'ODO', width: 70, align: 'right', key: 'odo' },
  { label: 'GPS Time', width: 140, align: 'left', key: 'gps_time' },
  { label: 'Location', width: 180, align: 'left', key: 'locationName', altKey: 'Location', ellipsis: true },
  { label: 'Signal', width: 60, align: 'center', key: 'Signal_Strength' },
  { label: 'ACC', width: 50, align: 'center', key: 'acc' },
  { label: 'Valid', width: 50, align: 'center', key: 'valid' },
  { label: 'Head', width: 50, align: 'center', key: 'head' },
  { label: 'Lat', width: 90, align: 'center', key: 'latitude', digits: 6 },
  { label: 'Lng', width: 90, align: 'center', key: 'longitude', digits: 6 },
  { label: 'Fuel', width: 60, align: 'center', key: 'fuel', digits: 2 },
  { label: 'Mileage', width: 90, align: 'right', key: 'mileage', digits: 1 },
];
const columnTemplate = columnDefs.map(col => col.width + 'px').join(' ');
const totalWidth = columnDefs.reduce((acc, col) => acc + col.width, 0);

const VirtualizedTableRow = ({ row, index, style, getStatusColor, isActive, onClick }) => (
  <div
    style={{
      ...style,
      display: 'grid',
      gridTemplateColumns: columnTemplate,
      alignItems: 'center',
      columnGap: '0px',
      boxSizing: 'border-box',
      padding: '0 0',
      minWidth: totalWidth,
      backgroundColor: isActive ? 'rgba(37,104,159,0.13)' : (index % 2 === 0 ? 'rgba(59, 130, 246, 0.05)' : 'white'),
      fontWeight: isActive ? 700 : 400,
      color: isActive ? '#25689f' : undefined,
      borderLeft: isActive ? '4px solid #25689f' : '4px solid transparent',
      transition: 'background 0.2s, color 0.2s',
      cursor: 'pointer',
    }}
    className="border-b border-gray-100 text-xs"
    onClick={onClick}
  >
    <div
      style={{width: columnDefs[0].width, textAlign: columnDefs[0].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      title={String(index + 1)}
    >
      {index + 1}
    </div>
    <div
      style={{width: columnDefs[1].width, textAlign: columnDefs[1].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      className={`font-semibold ${getStatusColor(row.status)}`}
      title={row.status ?? '-'}
    >{row.status ?? '-'}</div>
    <div
      style={{width: columnDefs[2].width, textAlign: columnDefs[2].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      className={getStatusColor(row.status)}
      title={row.speed !== undefined ? Number(row.speed).toFixed(2) : '-'}
    >{row.speed !== undefined ? Number(row.speed).toFixed(2) : '-'}</div>
    <div
      style={{width: columnDefs[3].width, textAlign: columnDefs[3].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      className={getStatusColor(row.status)}
      title={row.odo !== undefined ? Number(row.odo).toLocaleString() : '-'}
    >{row.odo !== undefined ? Number(row.odo).toLocaleString() : '-'}</div>
    <div
      style={{width: columnDefs[4].width, textAlign: columnDefs[4].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      className={getStatusColor(row.status)}
      title={row.gps_time ? new Date(row.gps_time).toLocaleString() : '-'}
    >{row.gps_time ? new Date(row.gps_time).toLocaleString() : '-'}</div>
    <div
      style={{width: columnDefs[5].width, textAlign: columnDefs[5].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      className={getStatusColor(row.status)}
      title={(row.locationName || row.Location) ? String(row.locationName || row.Location) : '-'}
    >{(row.locationName || row.Location) ? String(row.locationName || row.Location) : '-'}</div>
    <div
      style={{width: columnDefs[6].width, textAlign: columnDefs[6].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      className={getStatusColor(row.status)}
      title={row.Signal_Strength !== undefined ? String(row.Signal_Strength) : '-'}
    >{row.Signal_Strength ?? '-'}</div>
    <div
      style={{width: columnDefs[7].width, textAlign: columnDefs[7].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      className={getStatusColor(row.status)}
      title={row.acc !== undefined ? String(row.acc) : '-'}
    >{row.acc ?? '-'}</div>
    <div
      style={{width: columnDefs[8].width, textAlign: columnDefs[8].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      className={getStatusColor(row.status)}
      title={row.valid !== undefined ? String(row.valid) : '-'}
    >{row.valid ?? '-'}</div>
    <div
      style={{width: columnDefs[9].width, textAlign: columnDefs[9].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      className={getStatusColor(row.status)}
      title={row.head !== undefined ? String(row.head) : '-'}
    >{row.head ?? '-'}</div>
    <div
      style={{width: columnDefs[10].width, textAlign: columnDefs[10].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      className={getStatusColor(row.status)}
      title={row.latitude !== undefined ? Number(row.latitude).toFixed(6) : '-'}
    >{row.latitude !== undefined ? Number(row.latitude).toFixed(6) : '-'}</div>
    <div
      style={{width: columnDefs[11].width, textAlign: columnDefs[11].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      className={getStatusColor(row.status)}
      title={row.longitude !== undefined ? Number(row.longitude).toFixed(6) : '-'}
    >{row.longitude !== undefined ? Number(row.longitude).toFixed(6) : '-'}</div>
    <div
      style={{width: columnDefs[12].width, textAlign: columnDefs[12].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      className={getStatusColor(row.status)}
      title={row.fuel !== undefined ? Number(row.fuel).toFixed(2) : '-'}
    >{row.fuel !== undefined ? Number(row.fuel).toFixed(2) : '-'}</div>
    <div
      style={{width: columnDefs[13].width, textAlign: columnDefs[13].align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}
      className={getStatusColor(row.status)}
      title={row.mileage !== undefined ? Number(row.mileage).toLocaleString(undefined, {maximumFractionDigits: 1}) : '-'}
    >{row.mileage !== undefined ? Number(row.mileage).toLocaleString(undefined, {maximumFractionDigits: 1}) : '-'}</div>
  </div>
);

const VirtualizedTable = ({ data, containerHeight = 400, currentIndex }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const dispatch = useDispatch();
  const itemHeight = 32; // Height of each row
  const overscan = 5; // Extra items to render outside visible area
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "Stop": return "text-[#FB2C36]";
      case "Moving": return "text-[#00C951]";
      case "Idle": return "text-[#F0B100]";
      default: return "text-gray-700";
    }
  }, []);
  const { visibleItems, totalHeight } = useMemo(() => {
    if (!data || data.length === 0) return { visibleItems: [], totalHeight: 0 };
    const containerHeightPx = containerHeight;
    const visibleCount = Math.ceil(containerHeightPx / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + overscan, data.length);
    const actualStartIndex = Math.max(0, startIndex - overscan);
    const visibleItems = data.slice(actualStartIndex, endIndex).map((item, index) => ({
      ...item,
      index: actualStartIndex + index,
      offsetTop: (actualStartIndex + index) * itemHeight
    }));
    return {
      visibleItems,
      totalHeight: data.length * itemHeight
    };
  }, [data, scrollTop, containerHeight, itemHeight, overscan]);
  const handleScroll = useCallback((e) => {
        setScrollTop(e.target.scrollTop);
    }, []);

    // Improved auto-scroll: only scroll if highlighted row is out of view
    useEffect(() => {
        if (currentIndex == null || !containerRef.current) return;
        const itemHeight = 32;
        const container = containerRef.current;
        const containerHeightPx = container.offsetHeight;
        const visibleStart = container.scrollTop;
        const visibleEnd = visibleStart + containerHeightPx;
        const rowTop = currentIndex * itemHeight;
        const rowBottom = rowTop + itemHeight;
        // If highlighted row is above or below visible area, scroll to center it
        if (rowTop < visibleStart || rowBottom > visibleEnd) {
            const targetScroll = currentIndex * itemHeight - (containerHeightPx / 2) + (itemHeight / 2);
            const maxScroll = container.scrollHeight - containerHeightPx;
            container.scrollTop = Math.max(0, Math.min(targetScroll, maxScroll));
        }
    }, [currentIndex, containerHeight]);
  if (!data || data.length === 0) return null;
    return ( 
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div
                ref={containerRef}
        className="overflow-auto"
        style={{ height: containerHeight, overflowX: 'auto' }}
        onScroll={handleScroll}
      >
        {/* Header (inside scroll container) - use same grid template */}
        <div style={{ display: 'grid', gridTemplateColumns: columnTemplate, minWidth: totalWidth }} className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10 text-xs py-2 font-semibold text-gray-700">
          {columnDefs.map((col, i) => (
            <div key={col.label} style={{width: col.width, textAlign: col.align, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px'}}>{col.label}</div>
          ))}
        </div>
        {/* Body */}
        <div style={{ height: totalHeight, position: 'relative', minWidth: totalWidth }}>
          {visibleItems.map((item) => (
            <VirtualizedTableRow
              key={item.msgid || item.index}
              row={item}
              index={item.index}
              style={{
                position: 'absolute',
                top: item.offsetTop,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
              getStatusColor={getStatusColor}
              isActive={item.index === currentIndex}
              onClick={() => {
                dispatch(setCurrentReplayIndex(item.index));
                // Update replay bar (currentTime) so animation starts from this row
                if (typeof window !== 'undefined' && window.dispatchEvent) {
                  const event = new CustomEvent('replay-seek', { detail: { index: item.index } });
                  window.dispatchEvent(event);
                }
                dispatch(setReplayPaused(false));
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ReplayDetailsTab = () => {
  const replayData = useSelector(selectReplayData);
  const replayLoading = useSelector(selectReplayLoading);
  const currentReplayIndex = useSelector(selectCurrentReplayIndex);
  return (
    <div className="flex-1 p-2">
      {replayLoading ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <svg
            className="animate-spin h-6 w-6 mb-2 text-[#25689f]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <div className="text-sm">Loading replay data...</div>
        </div>
      ) : replayData && Array.isArray(replayData) && replayData.length > 0 ? (
        <VirtualizedTable 
          data={replayData} 
          containerHeight={window.innerHeight - 200}
          currentIndex={currentReplayIndex}
        />
      ) : (
        <div className="text-center text-gray-500 py-8">
          <div className="text-2xl mb-2">🚗</div>
          <div className="text-sm">No replay data available</div>
        </div>
      )}
    </div>
  );
};

export default ReplayDetailsTab;
