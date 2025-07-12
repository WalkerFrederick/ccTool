'use client';
import PageWrapper from '@/components/PageWrapper';
import { useState } from 'react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { ElegooWSClient, PrinterAttributes, PrinterStatus } from '@/utils/elegoo-ws-client';


interface Printer {
  id: string;
  name: string;
  ip: string;
  status: 'connected' | 'connecting';
  mainboardId?: string;
  wsClient?: ElegooWSClient;
  printerStatus?: PrinterStatus;
  attributes?: PrinterAttributes;
}

export default function Home() {
  const { welcomeDismissed, dismissWelcome } = useSiteSettings();
  const [printers, setPrinters] = useState<Printer[]>([]);

  const addPrinter = () => {
    const ip = prompt('Enter printer IP address:');
    if (!ip) return;

    const newPrinter: Printer = {
      id: Date.now().toString(),
      name: `Printer ${printers.length + 1}`,
      ip,
      status: 'connecting',
    };

    setPrinters(prev => [...prev, newPrinter]);
    connectToPrinter(newPrinter);
  };

  const connectToPrinter = (printer: Printer) => {
    const wsClient = new ElegooWSClient(`ws://${printer.ip}/websocket`);

    wsClient.onMessage((msg) => {
      setPrinters(prev =>
        prev.map(p => {
          //check if the messsage is about current printer
          if (p.id === printer.id) {
            const baseUpdate = {
              ...p,
              status: 'connected' as const,
              mainboardId: msg.MainboardID || p.mainboardId,
              wsClient,
            };

            if (msg.Attributes) {
              //we have device info and need to update the printer with complete attributes
              return {
                ...baseUpdate,
                attributes: msg.Attributes,
              };
            }

            // Check if this is a status update message (direct data)
            if (msg.Status && typeof msg.Status === 'object') {
              const statusData = msg.Status as Record<string, unknown>;
              // Check if it looks like a status message by checking for key properties
              if (statusData.TempOfHotbed !== undefined || statusData.PrintInfo !== undefined) {
                return {
                  ...baseUpdate,
                  printerStatus: statusData as unknown as PrinterStatus,
                };
              }
            }

            return baseUpdate;
          }
          return p;
        })
      );
    });

    wsClient.connect();

    // Update printer with client
    setPrinters(prev =>
      prev.map(p => (p.id === printer.id ? { ...p, wsClient } : p))
    );
  };

  const refreshPrinters = () => {
    setPrinters(prev =>
      prev.map(printer => ({
        ...printer,
        status: 'connecting' as const,
      }))
    );

    printers.forEach(printer => {
      if (printer.wsClient) {
        printer.wsClient.close();
        connectToPrinter(printer);
      }
    });
  };

  const disconnectPrinter = (printerId: string) => {
    setPrinters(prev => {
      const printer = prev.find(p => p.id === printerId);
      if (printer?.wsClient) {
        printer.wsClient.close();
      }
      return prev.filter(p => p.id !== printerId);
    });
  };

  return (
    <div className="overflow-x-hidden">
      <PageWrapper>
        {/* Notification Card */}
        {!welcomeDismissed && (
          <div className="mb-8">
            <div className="bg-[var(--color-purple-50)] dark:bg-[var(--color-purple-950)] border border-[var(--color-purple-200)] dark:border-[var(--color-purple-800)] rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-[var(--color-purple-900)] dark:text-[var(--color-purple-100)]">
                      Welcome to ccTool
                    </h3>
                    <p className="mt-2  text-[var(--color-purple-900)] dark:text-[var(--color-purple-100)]">
                      To get started add the IP address to your Centuri Carbon
                      printer
                    </p>
                  </div>
                </div>
                <button
                  onClick={dismissWelcome}
                  className="text-[var(--color-purple-500)] hover:text-[var(--color-purple-700)] dark:text-[var(--color-purple-400)] dark:hover:text-[var(--color-purple-200)] transition-colors"
                  aria-label="Dismiss welcome message"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 mb-8">
          <button
            type="button"
            onClick={addPrinter}
            className="bg-[var(--color-purple-500)] hover:bg-[var(--color-purple-600)] text-white dark:bg-[var(--color-purple-400)] dark:hover:bg-[var(--color-purple-300)] dark:text-gray-900 px-4 py-2 rounded-lg transition-colors font-semibold cursor-pointer"
          >
            Add Printer
          </button>
          <button
            type="button"
            onClick={refreshPrinters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors font-semibold cursor-pointer"
          >
            Refresh
          </button>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 mb-8" />

        {/* Printer List */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          {printers.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Connected Printers
              </h2>
              <div className="space-y-4">
                {printers.map(printer => (
                  <div
                    key={printer.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {printer.attributes?.Name || printer.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {printer.ip}
                      </p>
                      {printer.attributes?.BrandName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {printer.attributes.BrandName} - {printer.attributes.MachineName}
                        </p>
                      )}
                      {printer.attributes?.FirmwareVersion && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Firmware: {printer.attributes.FirmwareVersion}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          printer.status === 'connected'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : printer.status === 'connecting'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {printer.status}
                      </span>
                      <button
                        onClick={() => disconnectPrinter(printer.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        aria-label="Disconnect printer"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                NO PRINTERS FOUND
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Add a printer to get started with ccTool
              </p>
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}
