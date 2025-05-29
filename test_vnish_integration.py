#!/usr/bin/env python3
"""
Test script for Vnish firmware integration.

This script tests the integration between the ML recommendation engine and
Vnish firmware, verifying that recommendations can be applied to miners.
"""

import os
import sys
import json
import logging
import argparse
from typing import Dict, Any, List, Optional

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the necessary modules
from api_clients.vnish_firmware_client import VnishFirmwareClient
from api_clients.credential_store import VnishCredentialManager
from api_clients.config_validation import ValidationError
from ml_engine.vnish_integration import VnishMLIntegration, VnishIntegrationError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_credential_manager():
    """Test the VnishCredentialManager."""
    logger.info("Testing VnishCredentialManager...")
    
    # Create a credential manager
    credential_manager = VnishCredentialManager()
    
    # Test environment variables
    if os.environ.get("VNISH_HOST") and os.environ.get("VNISH_USERNAME") and os.environ.get("VNISH_PASSWORD"):
        logger.info("Found Vnish credentials in environment variables")
        try:
            miner_ip, username, password = credential_manager.get_credentials()
            logger.info(f"Successfully retrieved credentials for {miner_ip}")
        except Exception as e:
            logger.error(f"Error retrieving credentials: {str(e)}")
            return False
    else:
        logger.warning("Vnish credentials not found in environment variables")
        logger.info("You can set them with:")
        logger.info("export VNISH_HOST=<miner_ip>")
        logger.info("export VNISH_USERNAME=<username>")
        logger.info("export VNISH_PASSWORD=<password>")
        
        # Test saving and retrieving credentials
        test_ip = "192.168.1.101"
        test_username = "admin"
        test_password = "admin"
        
        logger.info(f"Saving test credentials for {test_ip}...")
        success = credential_manager.save_credentials(test_ip, test_username, test_password, True)
        
        if not success:
            logger.error("Failed to save credentials")
            return False
        
        logger.info("Retrieving test credentials...")
        try:
            miner_ip, username, password = credential_manager.get_credentials(test_ip)
            logger.info(f"Successfully retrieved credentials for {miner_ip}")
            
            # Verify credentials
            if miner_ip != test_ip or username != test_username or password != test_password:
                logger.error("Retrieved credentials do not match saved credentials")
                return False
        except Exception as e:
            logger.error(f"Error retrieving credentials: {str(e)}")
            return False
        
        # Clean up
        logger.info("Deleting test credentials...")
        success = credential_manager.delete_credentials(test_ip)
        
        if not success:
            logger.error("Failed to delete credentials")
            return False
    
    logger.info("VnishCredentialManager tests passed")
    return True


def test_firmware_client(miner_ip: Optional[str] = None, username: Optional[str] = None, password: Optional[str] = None):
    """
    Test the VnishFirmwareClient.
    
    Args:
        miner_ip: IP address of the miner. If None, uses environment variables.
        username: Username for authentication. If None, uses environment variables.
        password: Password for authentication. If None, uses environment variables.
    """
    logger.info("Testing VnishFirmwareClient...")
    
    # Use environment variables if not provided
    if miner_ip is None:
        miner_ip = os.environ.get("VNISH_HOST")
    
    if username is None:
        username = os.environ.get("VNISH_USERNAME")
    
    if password is None:
        password = os.environ.get("VNISH_PASSWORD")
    
    if not miner_ip or not username or not password:
        logger.error("Miner IP, username, or password not provided")
        return False
    
    # Create a firmware client
    try:
        client = VnishFirmwareClient(
            miner_ip=miner_ip,
            username=username,
            password=password
        )
        
        # Test getting summary
        logger.info("Getting miner summary...")
        summary = client.get_summary()
        logger.info(f"Miner summary: {json.dumps(summary, indent=2)}")
        
        # Test getting chips status
        logger.info("Getting chips status...")
        chips_status = client.get_chips_status()
        logger.info(f"Chips status: {json.dumps(chips_status, indent=2)}")
        
        # Test getting telemetry
        logger.info("Getting telemetry...")
        telemetry = client.get_telemetry()
        logger.info(f"Telemetry: {json.dumps(telemetry, indent=2)}")
        
        logger.info("VnishFirmwareClient tests passed")
        return True
    except Exception as e:
        logger.error(f"Error testing VnishFirmwareClient: {str(e)}")
        return False


def test_vnish_integration(miner_ip: Optional[str] = None):
    """
    Test the VnishMLIntegration.
    
    Args:
        miner_ip: IP address of the miner. If None, uses environment variables.
    """
    logger.info("Testing VnishMLIntegration...")
    
    # Use environment variables if not provided
    if miner_ip is None:
        miner_ip = os.environ.get("VNISH_HOST")
    
    if not miner_ip:
        logger.error("Miner IP not provided")
        return False
    
    # Create a VnishMLIntegration
    try:
        integration = VnishMLIntegration()
        
        # Test getting telemetry
        logger.info(f"Getting telemetry for {miner_ip}...")
        telemetry = integration.get_miner_telemetry(miner_ip)
        logger.info(f"Telemetry: {json.dumps(telemetry, indent=2)}")
        
        # Test applying hashrate tuning (dry run)
        logger.info("Testing hashrate tuning (dry run)...")
        hashrate_recommendation = {
            "id": "test-hashrate",
            "type": "dynamic_hashrate_tuning",
            "miner_id": f"miner_{miner_ip}",
            "recommended_hashrate_percent": 80.0
        }
        
        result = integration.apply_hashrate_tuning_recommendation(
            recommendation=hashrate_recommendation,
            miner_ip=miner_ip,
            dry_run=True
        )
        
        logger.info(f"Hashrate tuning result: {json.dumps(result, indent=2)}")
        
        # Test applying power optimization (dry run)
        logger.info("Testing power optimization (dry run)...")
        power_recommendation = {
            "id": "test-power",
            "type": "power_optimization",
            "miner_id": f"miner_{miner_ip}",
            "power_reduction_percent": 15.0
        }
        
        result = integration.apply_power_optimization_recommendation(
            recommendation=power_recommendation,
            miner_ip=miner_ip,
            dry_run=True
        )
        
        logger.info(f"Power optimization result: {json.dumps(result, indent=2)}")
        
        # Test applying overclocking (dry run)
        logger.info("Testing overclocking (dry run)...")
        overclocking_recommendation = {
            "id": "test-overclocking",
            "type": "intelligent_overclocking",
            "miner_id": f"miner_{miner_ip}",
            "core_clock_offset": 50,
            "memory_clock_offset": 200,
            "power_limit_percent": 85.0,
            "core_voltage_offset": 10
        }
        
        result = integration.apply_overclocking_recommendation(
            recommendation=overclocking_recommendation,
            miner_ip=miner_ip,
            dry_run=True
        )
        
        logger.info(f"Overclocking result: {json.dumps(result, indent=2)}")
        
        logger.info("VnishMLIntegration tests passed")
        return True
    except Exception as e:
        logger.error(f"Error testing VnishMLIntegration: {str(e)}")
        return False


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Test Vnish firmware integration")
    parser.add_argument("--miner-ip", help="IP address of the miner")
    parser.add_argument("--username", help="Username for authentication")
    parser.add_argument("--password", help="Password for authentication")
    parser.add_argument("--test", choices=["all", "credentials", "client", "integration"], default="all", help="Test to run")
    
    args = parser.parse_args()
    
    if args.test == "all" or args.test == "credentials":
        if not test_credential_manager():
            logger.error("Credential manager tests failed")
            return 1
    
    if args.test == "all" or args.test == "client":
        if not test_firmware_client(args.miner_ip, args.username, args.password):
            logger.error("Firmware client tests failed")
            return 1
    
    if args.test == "all" or args.test == "integration":
        if not test_vnish_integration(args.miner_ip):
            logger.error("Vnish integration tests failed")
            return 1
    
    logger.info("All tests passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
