// Update the scan button and add scanning state UI

{!isReadOnly && !isEditMode && (
  <div className="flex gap-2">
    <Input
      id="sku"
      value={formData.sku}
      onChange={(e) => handleInputChange('sku', e.target.value)}
      placeholder="e.g., DON-000001"
      className="font-mono"
      disabled={isReadOnly || scanning}
    />
    <Button
      type="button"
      variant={scanning ? "destructive" : "outline"}
      onClick={() => {
        if (!scanning) {
          setScanning(true);
          setLastScan("");
          toast.info("Ready to scan. Point camera at barcode...", {
            autoClose: 3000,
          });
        } else {
          setScanning(false);
          toast.info("Scanning stopped", { autoClose: 2000 });
        }
      }}
      className="whitespace-nowrap gap-2 relative overflow-hidden"
      disabled={isSubmitting}
    >
      {scanning ? (
        <>
          <div className="relative">
            <Camera className="h-4 w-4 animate-pulse" />
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
          </div>
          <span className="relative">
            Scanning...
            <span className="absolute -top-1 -right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          </span>
        </>
      ) : (
        <>
          <Camera className="h-4 w-4" />
          Scan Barcode
        </>
      )}
    </Button>
  </div>
)}

// Add a scanning overlay/indicator when scanning is active
{scanning && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    onClick={() => setScanning(false)}
  >
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      {/* Scanning Animation */}
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        {/* Outer Scanning Ring */}
        <div className="absolute inset-0 border-4 border-primary/20 rounded-2xl" />
        
        {/* Scanning Laser Effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan_2s_linear_infinite]" />
        
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
        
        {/* Center Target */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 border-2 border-primary/40 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full animate-ping" />
            </div>
          </div>
        </div>
        
        {/* Scanning Text */}
        <div className="absolute -bottom-16 left-0 right-0 text-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="space-y-2"
          >
            <div className="flex items-center justify-center gap-2">
              <Camera className="h-5 w-5 text-primary animate-pulse" />
              <h3 className="text-xl font-display font-semibold text-white">
                Scanning...
              </h3>
            </div>
            <p className="text-sm text-primary/80">
              Point camera at barcode
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-white/60">
              <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
              <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-150" />
              <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-300" />
              <span className="ml-2">Looking for barcode</span>
            </div>
          </motion.div>
        </div>
        
        {/* Success/Failure Indicator */}
        {lastScan && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-20 left-0 right-0"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg mx-auto w-max">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Barcode Scanned!</p>
                  <p className="text-sm opacity-90">SKU: {lastScan}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Instructions Panel */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-12 bg-black/40 backdrop-blur-md rounded-xl p-6 max-w-md mx-auto border border-white/10"
      >
        <h4 className="font-display font-medium text-white mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          Scanning Tips
        </h4>
        <ul className="space-y-2 text-sm text-white/70">
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
            Ensure good lighting on the barcode
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
            Hold camera steady for 2-3 seconds
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
            Keep barcode within the scanning frame
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
            Scan will auto-populate SKU field
          </li>
        </ul>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <Button
            onClick={() => setScanning(false)}
            variant="destructive"
            size="sm"
            className="w-full gap-2"
          >
            <X className="h-4 w-4" />
            Stop Scanning
          </Button>
        </div>
      </motion.div>
    </div>
  </motion.div>
)}

// Also add the keyframes for scanning animation to your tailwind config
// In your tailwind.config.ts, add this keyframe:

keyframes: {
  // ... existing keyframes ...
  scan: {
    '0%': { transform: 'translateY(0) scaleX(1)' },
    '50%': { transform: 'translateY(320px) scaleX(1.2)' },
    '100%': { transform: 'translateY(640px) scaleX(1)' },
  },
},

// Update the handleScan function to show success feedback
const handleScan = (code: string) => {
  setLastScan(code);
  setFormData(prev => ({ ...prev, sku: code })); 
  
  // Show success toast
  toast.success(`Barcode scanned: ${code}`, {
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    autoClose: 3000,
  });
  
  // Auto-stop scanning after 3 seconds
  setTimeout(() => {
    setScanning(false);
  }, 3000);
};

// Also, add a loading state when starting scanning
const [isInitializingCamera, setIsInitializingCamera] = useState(false);

const startScanning = async () => {
  if (!scanning) {
    setIsInitializingCamera(true);
    setLastScan("");
    
    // Simulate camera initialization delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setScanning(true);
    setIsInitializingCamera(false);
    
    toast.info("Camera ready. Point at barcode...", {
      autoClose: 3000,
    });
  } else {
    setScanning(false);
  }
};

// Update the scan button to show initializing state
<Button
  type="button"
  variant={scanning ? "destructive" : "outline"}
  onClick={startScanning}
  className="whitespace-nowrap gap-2 relative overflow-hidden"
  disabled={isSubmitting || isInitializingCamera}
>
  {isInitializingCamera ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Initializing...</span>
    </>
  ) : scanning ? (
    <>
      <div className="relative">
        <Camera className="h-4 w-4 animate-pulse" />
        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
      </div>
      <span className="relative">
        Scanning...
        <span className="absolute -top-1 -right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
      </span>
    </>
  ) : (
    <>
      <Camera className="h-4 w-4" />
      Scan Barcode
    </>
  )}
</Button>