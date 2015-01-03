#!/bin/bash

sudo cp ./deployiosd.service /etc/systemd/system/

sudo systemctl enable deployiosd.service
sudo systemctl start deployiosd.service
sudo systemctl status deployiosd.service

