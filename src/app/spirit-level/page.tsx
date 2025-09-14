export default function SpiritLevel() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Spirit Level
        </h1>
        
        <div className="space-y-6">
          {/* 수평계 시각화 */}
          <div className="bg-gray-200 rounded-lg p-6 relative">
            <div className="w-full h-4 bg-gray-300 rounded-full relative overflow-hidden">
              {/* 수평선 표시 */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 transform -translate-y-1/2"></div>
              
              {/* 기포 시뮬레이션 */}
              <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-80">
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
            
            {/* 각도 표시 */}
            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <span>-5°</span>
              <span className="font-bold text-green-600">0°</span>
              <span>+5°</span>
            </div>
          </div>
          
          {/* 상태 표시 */}
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              Level
            </div>
            <p className="text-gray-600">
              기기를 수평으로 유지하세요
            </p>
          </div>
          
          {/* 사용법 안내 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">사용법</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 기기를 측정할 표면에 올려놓으세요</li>
              <li>• 파란색 기포가 중앙에 오도록 조정하세요</li>
              <li>• 기포가 중앙에 있으면 수평입니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
