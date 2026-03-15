import win32serviceutil
import win32service
import win32event
import servicemanager
import subprocess
import sys
import os

class PrintService(win32serviceutil.ServiceFramework):
    _svc_name_ = "PrintServiceSuances"
    _svc_display_name_ = "Print Service - Restaurante Suances"
    _svc_description_ = "Servicio de impresión de tickets para el restaurante"
    
    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.stop_event = win32event.CreateEvent(None, 0, 0, None)
        self.process = None
    
    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.stop_event)
        if self.process:
            self.process.terminate()
    
    def SvcDoRun(self):
        servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                              servicemanager.PYS_SERVICE_STARTED,
                              (self._svc_name_, ''))
        
        script_path = os.path.join(os.path.dirname(__file__), "print_service.py")
        self.process = subprocess.Popen([sys.executable, script_path],
                                       stdout=subprocess.PIPE,
                                       stderr=subprocess.PIPE)
        self.process.wait()

if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(PrintService)
