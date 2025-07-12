import time
import json
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WhatsAppAutomation:
    def __init__(self, api_base_url="http://localhost:5000/api"):
        self.api_base_url = api_base_url
        self.driver = None
        self.last_message_count = 0
        self.processed_messages = set()
        
    def setup_driver(self):
        """Setup Chrome driver with necessary options"""
        options = Options()
        options.add_argument("--user-data-dir=./User_Data")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        # Remove headless mode for initial QR code scan
        # options.add_argument("--headless")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        
    def login_whatsapp(self):
        """Login to WhatsApp Web"""
        logger.info("Opening WhatsApp Web...")
        self.driver.get("https://web.whatsapp.com")
        
        # Wait for QR code or main interface
        try:
            # Wait for either QR code or main interface
            WebDriverWait(self.driver, 60).until(
                EC.any_of(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='qr-code']")),
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='chat-list']"))
                )
            )
            logger.info("WhatsApp Web loaded successfully")
            
            # Check if we need to scan QR code
            qr_code = self.driver.find_elements(By.CSS_SELECTOR, "div[data-testid='qr-code']")
            if qr_code:
                logger.info("Please scan the QR code to login...")
                # Wait for successful login
                WebDriverWait(self.driver, 60).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='chat-list']"))
                )
                logger.info("Successfully logged in to WhatsApp Web")
            
        except Exception as e:
            logger.error(f"Error during WhatsApp login: {str(e)}")
            raise
            
    def get_chat_messages(self, chat_name="Pool Maintenance"):
        """Get messages from a specific chat"""
        try:
            # Search for the chat
            search_box = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='chat-list-search']"))
            )
            search_box.click()
            
            search_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='chat-list-search'] input"))
            )
            search_input.clear()
            search_input.send_keys(chat_name)
            search_input.send_keys(Keys.ENTER)
            
            # Wait for chat to load
            time.sleep(2)
            
            # Click on the chat
            chat_element = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, f"span[title='{chat_name}']"))
            )
            chat_element.click()
            
            # Wait for messages to load
            time.sleep(2)
            
            # Get all messages
            messages = self.driver.find_elements(By.CSS_SELECTOR, "div[data-testid='conversation-panel-messages'] div[data-testid='msg-container']")
            
            new_messages = []
            for message in messages[-10:]:  # Get last 10 messages
                try:
                    # Get message text
                    message_text_element = message.find_element(By.CSS_SELECTOR, "span.selectable-text")
                    message_text = message_text_element.text
                    
                    # Get timestamp
                    timestamp_element = message.find_element(By.CSS_SELECTOR, "div[data-testid='msg-meta'] span")
                    timestamp = timestamp_element.get_attribute("data-pre-plain-text")
                    
                    # Create unique message ID
                    message_id = f"{timestamp}_{message_text[:20]}"
                    
                    if message_id not in self.processed_messages:
                        new_messages.append({
                            'id': message_id,
                            'text': message_text,
                            'timestamp': timestamp
                        })
                        self.processed_messages.add(message_id)
                        
                except Exception as e:
                    logger.debug(f"Error processing message: {str(e)}")
                    continue
                    
            return new_messages
            
        except Exception as e:
            logger.error(f"Error getting chat messages: {str(e)}")
            return []
            
    def process_message_with_api(self, message_text):
        """Send message to backend API for processing"""
        try:
            response = requests.post(
                f"{self.api_base_url}/process-message",
                json={"message": message_text},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Message processed successfully: {result}")
                return result
            else:
                logger.error(f"API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error calling API: {str(e)}")
            return None
            
    def monitor_messages(self, chat_name="Pool Maintenance", interval=30):
        """Monitor messages and process them"""
        logger.info(f"Starting message monitoring for chat: {chat_name}")
        
        while True:
            try:
                new_messages = self.get_chat_messages(chat_name)
                
                for message in new_messages:
                    logger.info(f"Processing new message: {message['text']}")
                    result = self.process_message_with_api(message['text'])
                    
                    if result and result.get('success'):
                        logger.info(f"Successfully processed message for Villa {result.get('villa_number', 'Unknown')}")
                    else:
                        logger.warning(f"Failed to process message: {message['text']}")
                        
                time.sleep(interval)
                
            except KeyboardInterrupt:
                logger.info("Stopping message monitoring...")
                break
            except Exception as e:
                logger.error(f"Error in message monitoring: {str(e)}")
                time.sleep(interval)
                
    def send_message(self, chat_name, message_text):
        """Send a message to a specific chat"""
        try:
            # Search and open chat
            search_box = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='chat-list-search']"))
            )
            search_box.click()
            
            search_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='chat-list-search'] input"))
            )
            search_input.clear()
            search_input.send_keys(chat_name)
            search_input.send_keys(Keys.ENTER)
            
            time.sleep(2)
            
            # Click on chat
            chat_element = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, f"span[title='{chat_name}']"))
            )
            chat_element.click()
            
            # Find message input box
            message_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='conversation-compose-box-input']"))
            )
            
            # Type and send message
            message_input.send_keys(message_text)
            message_input.send_keys(Keys.ENTER)
            
            logger.info(f"Message sent to {chat_name}: {message_text}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return False
            
    def close(self):
        """Close the driver"""
        if self.driver:
            self.driver.quit()
            logger.info("WhatsApp automation closed")

def main():
    """Main function to run WhatsApp automation"""
    automation = WhatsAppAutomation()
    
    try:
        automation.setup_driver()
        automation.login_whatsapp()
        
        # Start monitoring messages
        automation.monitor_messages(chat_name="Pool Maintenance", interval=30)
        
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error(f"Main error: {str(e)}")
    finally:
        automation.close()

if __name__ == "__main__":
    main()