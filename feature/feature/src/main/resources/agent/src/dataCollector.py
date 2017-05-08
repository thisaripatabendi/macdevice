#!/usr/bin/env python
"""
/**
* Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
* WSO2 Inc. licenses this file to you under the Apache License,
* Version 2.0 (the "License"); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied. See the License for the
* specific language governing permissions and limitations
* under the License.
**/
"""
import os
import subprocess

import multiprocessing
import random

import psutil


def getBatteryLevel():

    BATTERY_CMD = ["/usr/sbin/ioreg", "-l"]
    GREP_CMD = ["/usr/bin/egrep", "Capacity|ExternalChargeCapable"]

    process = subprocess.Popen(BATTERY_CMD, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    grep = subprocess.Popen(GREP_CMD, stdin=process.stdout, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    grep.wait()

    output = grep.communicate()[0]

    if len(output) < 3:
        remaining = random_battery_level()
    else:
        batteryStatus = output.split("\n")

        maxCapacity = float(batteryStatus[1].split("=")[1].lstrip())
        curCapacity = float(batteryStatus[2].split("=")[1].lstrip())

        if maxCapacity == 0:
            remaining = random_battery_level()
        else:
            remaining = 100 * (curCapacity / maxCapacity)

    return remaining

def getBatteryStatus():

    BATTERY_CMD = ["/usr/sbin/ioreg", "-l"]
    GREP_CMD = ["/usr/bin/egrep", "Capacity|ExternalChargeCapable"]

    process = subprocess.Popen(BATTERY_CMD, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    grep = subprocess.Popen(GREP_CMD, stdin=process.stdout, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    grep.wait()
    output = grep.communicate()[0]

    if len(output) < 3:
        batteryStatus = random_battery_status()
    else:
        batteryStatus = output.split("\n")

        if len(batteryStatus) < 3:
            batteryStatus = 1

        if "Yes" in batteryStatus[0]:
            batteryStatus = 1
        else:
            batteryStatus = 0

    return batteryStatus


def getCPUUsage():

    count = psutil.cpu_count()
    usage_arr = psutil.cpu_percent(interval=1, percpu=True)

    total = 0
    for x in usage_arr:
        total = total + x

    cpuusage = total / count
    return cpuusage


def random_battery_level():
    bat_level = random.randint(1, 99)
    return bat_level

def random_battery_status():
    bat_status = random.randint(0, 1)
    return bat_status